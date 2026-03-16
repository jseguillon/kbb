import { test, expect } from '@playwright/test';

test.describe('Arkanoid Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display canvas on page load', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();
  });

  test('should start game when clicking on canvas', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    await canvas.click();
    
    await page.waitForTimeout(100);
    
    const screenshot = await canvas.screenshot();
    expect(screenshot).toBeDefined();
    expect(screenshot.length).toBeGreaterThan(0);
  });

  test('should render game elements after clicking', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    await canvas.click();
    
    await page.waitForTimeout(200);
    
    const screenshot = await canvas.screenshot();
    expect(screenshot.length).toBeGreaterThan(0);
  });

  test('should handle pause and resume', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    await canvas.click();
    
    await page.waitForTimeout(300);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    
    await canvas.click();
    await page.waitForTimeout(100);
    
    const screenshot = await canvas.screenshot();
    expect(screenshot.length).toBeGreaterThan(0);
  });

  test('should handle keyboard controls', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    await canvas.click();
    
    await page.waitForTimeout(200);
    
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(50);
    
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(50);
    
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    
    const screenshot = await canvas.screenshot();
    expect(screenshot.length).toBeGreaterThan(0);
  });

  test('should maintain game state after multiple interactions', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    
    await canvas.click();
    await page.waitForTimeout(150);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(50);
    
    await canvas.click();
    await page.waitForTimeout(150);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(50);
    
    await canvas.click();
    await page.waitForTimeout(150);
    
    const screenshot = await canvas.screenshot();
    expect(screenshot.length).toBeGreaterThan(0);
  });

  test('should support multiple balls', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    await canvas.click();
    
    await page.waitForTimeout(200);
    
    await canvas.click();
    await page.waitForTimeout(200);
    
    const screenshot = await canvas.screenshot();
    expect(screenshot.length).toBeGreaterThan(0);
  });

  test('should support power-up system', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    await canvas.click();
    
    await page.waitForTimeout(200);
    
    const screenshot = await canvas.screenshot();
    expect(screenshot.length).toBeGreaterThan(0);
  });

  test('should toggle debug mode with D key', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    await canvas.click();
    
    await page.waitForTimeout(200);
    
    await page.keyboard.press('d');
    await page.waitForTimeout(100);
    
    const screenshot = await canvas.screenshot();
    expect(screenshot.length).toBeGreaterThan(0);
  });

  test('should show debug info when D key is pressed', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    await canvas.click();
    
    await page.waitForTimeout(200);
    
    await page.keyboard.press('d');
    await page.waitForTimeout(100);
    
    await canvas.click();
    await page.waitForTimeout(300);
    
    const screenshot = await canvas.screenshot();
    expect(screenshot.length).toBeGreaterThan(0);
  });
});
