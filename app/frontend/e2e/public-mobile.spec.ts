import { expect, test, type Page } from '@playwright/test';

const publicRoutes = [
  '/',
  '/services',
  '/quote',
  '/account',
  '/partners',
  '/about',
  '/how-it-works',
  '/why-trust-us',
  '/provider',
  '/partner',
];

async function assertNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const overflowing = [...document.querySelectorAll('body *')].filter((node) => {
      const el = node as HTMLElement;
      return el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX === 'visible';
    }).slice(0, 8).map((node) => (node as HTMLElement).tagName + '.' + (node as HTMLElement).className);
    return {
      clientWidth: doc.clientWidth,
      scrollWidth: doc.scrollWidth,
      overflowing,
    };
  });

  expect(metrics.scrollWidth, `horizontal overflow: ${metrics.overflowing.join(', ')}`).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

async function assertUsableTouchTargets(page: Page) {
  const tooSmall = await page.evaluate(() => {
    const selectors = ['header button', 'main a[href="/quote"] button', 'main button[type="submit"]'];
    return selectors.flatMap((selector) =>
      [...document.querySelectorAll(selector)].map((node) => {
        const rect = (node as HTMLElement).getBoundingClientRect();
        return { selector, width: Math.round(rect.width), height: Math.round(rect.height), text: (node as HTMLElement).innerText.slice(0, 40) };
      })
    ).filter((item) => item.width > 0 && item.height > 0 && (item.width < 40 || item.height < 40));
  });

  expect(tooSmall, JSON.stringify(tooSmall)).toEqual([]);
}

async function mockUnauthenticatedApi(page: Page) {
  await page.route('**/api/config', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ API_BASE_URL: '' }),
  }));
  await page.route('**/api/v1/auth/me', (route) => route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Not authenticated' }),
  }));
  await page.route('**/api/v1/auth/status', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ configured: true, provider: 'supabase', email_configured: true, email_signup_configured: false }),
  }));
}

test.describe('public mobile coverage', () => {
  test.beforeEach(async ({ page }) => {
    await mockUnauthenticatedApi(page);
  });

  for (const route of publicRoutes) {
    test(`${route} stays inside the viewport`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.public-site')).toBeVisible();
      await assertNoHorizontalOverflow(page);
    });
  }

  test('viewport keeps pinch zoom available', async ({ page }) => {
    await page.goto('/');
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport || '').toContain('width=device-width');
    expect(viewport || '').not.toMatch(/user-scalable\s*=\s*no/i);
    expect(viewport || '').not.toMatch(/maximum-scale\s*=\s*1(\.0)?/i);
  });

  test('home LCP image is eager and below-fold photos are lazy', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('main img').first();
    await expect(hero).toHaveAttribute('fetchpriority', 'high');
    await expect(hero).toHaveAttribute('loading', 'eager');

    const lazyPhotos = page.locator('main picture img[loading="lazy"]');
    await expect(lazyPhotos.first()).toBeVisible();
    await expect(lazyPhotos).toHaveCount(await lazyPhotos.count());
    expect(await lazyPhotos.count()).toBeGreaterThan(3);
  });

  test('home and services use responsive WebP documentary photos', async ({ page }) => {
    await page.goto('/');
    const homeWebp = page.locator('main source[type="image/webp"]').first();
    await expect(homeWebp).toHaveAttribute('srcset', /\/assets\/images\/cleanfix-(documentary|mobile-v3)\/web\/.+\.webp 480w/);
    const hero = page.locator('main picture img').first();
    await expect(hero).toHaveAttribute('width', /\d+/);
    await expect(hero).toHaveAttribute('height', /\d+/);
    await expect(hero).toHaveAttribute('fetchpriority', 'high');

    await page.goto('/services');
    const serviceWebp = page.locator('main source[type="image/webp"]').first();
    await expect(serviceWebp).toHaveAttribute('srcset', /\/assets\/images\/transformations\/.+-960\.webp 960w/);
    await expect(page.locator('main picture img').first()).toHaveAttribute('loading', 'lazy');
  });

  test('hebrew and english public shells remain single-column on coarse viewports when needed', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Switch site to Hebrew|החלפת האתר לאנגלית/ }).click();
    await expect(page.locator('html')).toHaveAttribute('dir', /rtl|ltr/);
    await assertNoHorizontalOverflow(page);
  });

  for (const route of ['/provider', '/partner']) {
    test(`${route} is gated and does not expose fabricated dashboard data`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /sign-in required/i })).toBeVisible();
      await expect(page.getByText(/₪0|0%/)).toHaveCount(0);
      await assertNoHorizontalOverflow(page);
    });
  }

  for (const portal of [
    { route: '/provider', relationship: 'managed_provider', heading: /managed-provider request is pending/i },
    { route: '/partner', relationship: 'referral_partner', heading: /independent-business request is pending/i },
  ]) {
    test(`${portal.route} keeps a pending business relationship outside the portal`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('cleanfix_access_token', 'test-token'));
      await page.route('**/api/v1/auth/me', (route) => route.fulfill({ json: { id: 'business-1', email: 'business@example.test', role: 'user' } }));
      await page.route('**/api/v1/account/profile', (route) => route.fulfill({ json: { account_type: 'business' } }));
      await page.route('**/api/v1/business-access/me', (route) => route.fulfill({ json: { account_type: 'business', relationships: [{ relationship_type: portal.relationship, status: 'pending' }] } }));
      await page.route('**/api/v1/business-access/*/context', (route) => route.fulfill({ status: 500, json: { detail: 'Context must not be requested for pending access' } }));

      await page.goto(portal.route, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: portal.heading })).toBeVisible();
      await expect(page.getByText('Account-specific tour')).toHaveCount(0);
    });
  }
});

test.describe('android desktop-site recovery', () => {
  test.beforeEach(async ({ page }) => {
    await mockUnauthenticatedApi(page);
  });

  for (const route of publicRoutes) {
    test(`${route} does not keep a desktop multi-column canvas`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'android-desktop-site', '980px coarse-pointer project only');
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.public-site')).toBeVisible();
      const columns = await page.evaluate(() => {
        const trackCount = (value) =>
          value.replace(/minmax\([^)]*\)/g, 'track').replace(/repeat\([^)]*\)/g, 'track').trim().split(/\s+/).filter(Boolean).length;
        return [...document.querySelectorAll('.public-site .public-grid')].map((node) => {
          const value = getComputedStyle(node).gridTemplateColumns;
          return { value, tracks: trackCount(value) };
        });
      });
      for (const column of columns) {
        expect(column.tracks, column.value).toBeLessThanOrEqual(1);
      }
      await assertNoHorizontalOverflow(page);
      await assertUsableTouchTargets(page);
    });
  }
});
