const base = process.env.SEO_BASE_URL || 'https://cleanfixharish.co.il';
const routes = ['/', '/services', '/gardening', '/how-it-works', '/local-partners', '/quote', '/partners', '/about'];
let failures = 0;
for (const route of routes) {
  const response = await fetch(`${base}${route}`, { redirect: 'follow' });
  const html = await response.text();
  const checks = {
    status: response.ok,
    title: /<title[^>]*>[^<]{10,}<\/title>/i.test(html),
    description: /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{30,}/i.test(html),
    viewport: /name=["']viewport["']/i.test(html),
    canonicalOrSpaManaged: /rel=["']canonical["']/i.test(html) || html.includes('/src/main'),
  };
  const failed = Object.entries(checks).filter(([, value]) => !value).map(([name]) => name);
  if (failed.length) failures += 1;
  console.log(JSON.stringify({ route, status: response.status, failed }));
}
const robots = await fetch(`${base}/robots.txt`);
const sitemap = await fetch(`${base}/sitemap.xml`);
const sitemapXml = await sitemap.text();
const sitemapLocations = [...sitemapXml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
  .map((match) => match[1].trim());
const duplicateLocations = [...new Set(
  sitemapLocations.filter((location, index) => sitemapLocations.indexOf(location) !== index),
)];
const sitemapChecks = {
  status: sitemap.ok,
  hasCanonicalHowItWorks: sitemapLocations.some((location) => new URL(location).pathname === '/how-it-works'),
  excludesLegacyHowWeWork: !sitemapLocations.some((location) => new URL(location).pathname === '/how-we-work'),
  uniqueLocations: duplicateLocations.length === 0,
};
const failedSitemapChecks = Object.entries(sitemapChecks)
  .filter(([, value]) => !value)
  .map(([name]) => name);
if (!robots.ok || failedSitemapChecks.length) failures += 1;
console.log(JSON.stringify({
  robots: robots.status,
  sitemap: sitemap.status,
  sitemapUrls: sitemapLocations.length,
  duplicateLocations,
  failedSitemapChecks,
  failures,
}));
if (failures) process.exitCode = 1;
