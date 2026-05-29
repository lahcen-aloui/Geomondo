import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/GeoMondo/);
});

test('how it works page loads from the localized route', async ({ page }) => {
  await page.goto('/en/come-funziona');

  await expect(page.getByRole('heading', { name: 'How it works' })).toBeVisible();
  await expect(page.getByText('Three simple steps to explore the world')).toBeVisible();
});

test('result page shows an empty state without an active game', async ({ page }) => {
  await page.goto('/en/risultato');

  await expect(page.getByRole('heading', { name: 'No result available' })).toBeVisible();
  await expect(page.getByRole('main').getByRole('link', { name: 'Play' })).toBeVisible();
});
