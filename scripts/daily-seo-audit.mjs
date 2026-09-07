const base = (process.env.PRODUCTION_BASE_URL || process.env.SEO_BASE_URL || 'https://cleanfixharish.co.il')
  .replace(/\/$/, '');
const seoRoutes = ['/', '/services', '/gardening', '/how-it-works', '/local-partners', '/quote', '/partners', '/about'];
const applicationRoutes = ['/admin', '/account'];
const requiredSecurityHeaders = {
  'content-security-policy': (value) => value.includes("default-src 'self'") && value.includes("frame-ancestors 'none'"),
  'strict-transport-security': (value) => value.includes('max-age='),
  'x-content-type-options': (value) => value.toLowerCase() === 'nosniff',
  'x-frame-options': (value) => value.toUpperCase() === 'DENY',
  'referrer-policy': (value) => value.length > 0,
};

let failures = 0;

async function request(path, options = {}) {
  const startedAt = performance.now();
  const response = await fetch(`${base}${path}`, {
    headers: { 'user-agent': 'CleanFixHarish-Production-Audit/1.0' },
    signal: AbortSignal.timeout(15_000),
    ...options,
  });
  return { response, durationMs: Math.round(performance.now() - startedAt) };
}

function failedChecks(checks) {
  return Object.entries(checks).filter(([, value]) => !value).map(([name]) => name);
}

function securityChecks(response) {
  return Object.fromEntries(Object.entries(requiredSecurityHeaders).map(([header, validate]) => {
    const value = response.headers.get(header) || '';
    return [`header:${header}`, validate(value)];
  }));
}

async function runCheck(name, check) {
  try {
    const result = await check();
    const failed = failedChecks(result.checks);
    if (failed.length) failures += 1;
    console.log(JSON.stringify({ name, ...result.details, failed }));
  } catch (error) {
    failures += 1;
    console.error(JSON.stringify({ name, failed: ['request'], error: error.message }));
  }
}

for (const route of seoRoutes) {
  await runCheck(`page:${route}`, async () => {
    const { response, durationMs } = await request(route, { redirect: 'follow' });
    const html = await response.text();
    return {
      checks: {
        status: response.ok,
        html: (response.headers.get('content-type') || '').includes('text/html'),
        title: /<title[^>]*>[^<]{10,}<\/title>/i.test(html),
        description: /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{30,}/i.test(html),
        viewport: /name=["']viewport["']/i.test(html),
        canonicalOrSpaManaged: /rel=["']canonical["']/i.test(html) || html.includes('/src/main'),
        ...securityChecks(response),
      },
      details: { route, status: response.status, durationMs },
    };
  });
}

for (const route of applicationRoutes) {
  await runCheck(`application:${route}`, async () => {
    const { response, durationMs } = await request(route, { redirect: 'follow' });
    const html = await response.text();
    return {
      checks: {
        status: response.ok,
        html: (response.headers.get('content-type') || '').includes('text/html'),
        applicationShell: /<div[^>]+id=["']root["']/i.test(html),
        ...securityChecks(response),
      },
      details: { route, status: response.status, durationMs },
    };
  });
}

for (const endpoint of ['/health', '/health/ready']) {
  await runCheck(`health:${endpoint}`, async () => {
    const { response, durationMs } = await request(endpoint, { redirect: 'error' });
    const body = await response.json();
    const isReadiness = endpoint.endsWith('/ready');
    return {
      checks: {
        status: response.ok,
        json: (response.headers.get('content-type') || '').includes('application/json'),
        state: body.status === (isReadiness ? 'ready' : 'healthy'),
        ...(isReadiness ? { database: body.database === 'healthy' } : {}),
        ...securityChecks(response),
      },
      details: { endpoint, status: response.status, durationMs },
    };
  });
}

await runCheck('redirect:/how-we-work', async () => {
  const { response, durationMs } = await request('/how-we-work', { redirect: 'manual' });
  return {
    checks: {
      permanentRedirect: response.status === 308,
      canonicalTarget: response.headers.get('location') === '/how-it-works',
    },
    details: { status: response.status, location: response.headers.get('location'), durationMs },
  };
});

await runCheck('discovery', async () => {
  const [{ response: robots, durationMs: robotsDurationMs }, { response: sitemap, durationMs: sitemapDurationMs }]
    = await Promise.all([request('/robots.txt'), request('/sitemap.xml')]);
  const [robotsText, sitemapXml] = await Promise.all([robots.text(), sitemap.text()]);
  const sitemapLocations = [...sitemapXml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
    .map((match) => match[1].trim());
  const duplicateLocations = [...new Set(
    sitemapLocations.filter((location, index) => sitemapLocations.indexOf(location) !== index),
  )];
  return {
    checks: {
      robotsStatus: robots.ok,
      sitemapStatus: sitemap.ok,
      robotsReferencesSitemap: /sitemap:\s*https:\/\//i.test(robotsText),
      hasCanonicalHowItWorks: sitemapLocations.some((location) => new URL(location).pathname === '/how-it-works'),
      excludesLegacyHowWeWork: !sitemapLocations.some((location) => new URL(location).pathname === '/how-we-work'),
      uniqueLocations: duplicateLocations.length === 0,
    },
    details: {
      robots: robots.status,
      sitemap: sitemap.status,
      sitemapUrls: sitemapLocations.length,
      duplicateLocations,
      robotsDurationMs,
      sitemapDurationMs,
    },
  };
});

console.log(JSON.stringify({ base, checks: seoRoutes.length + applicationRoutes.length + 4, failures }));
if (failures) process.exitCode = 1;
