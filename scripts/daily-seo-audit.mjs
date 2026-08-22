const base = process.env.SEO_BASE_URL || 'https://cleanfixharish.co.il';
const routes = ['/', '/services', '/gardening', '/how-we-work', '/local-partners', '/quote', '/partners', '/about'];
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
if (!robots.ok || !sitemap.ok) failures += 1;
console.log(JSON.stringify({ robots: robots.status, sitemap: sitemap.status, failures }));
if (failures) process.exitCode = 1;
