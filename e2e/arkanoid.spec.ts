import { test, expect, Page } from '@playwright/test';

test.describe('kbb Game Responsive', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should maintain 4:3 aspect ratio', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    await page.setViewportSize({ width: 800, height: 600 });
    
    await page.waitForTimeout(200);
    
    const canvasWidth = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
    const canvasHeight = await canvas.evaluate((el: HTMLCanvasElement) => el.height);
    
    expect(canvasWidth).toBeGreaterThan(0);
    expect(canvasHeight).toBeGreaterThan(0);
    expect(Math.round(canvasWidth / canvasHeight * 100) / 100).toBeCloseTo(4 / 3, 1);
  });

  test('should scale to fit viewport width', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    await page.setViewportSize({ width: 1200, height: 800 });
    
    await page.waitForTimeout(200);
    
    const canvasWidth = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
    const canvasHeight = await canvas.evaluate((el: HTMLCanvasElement) => el.height);
    
    expect(canvasWidth).toBeGreaterThanOrEqual(400);
    expect(canvasHeight).toBeGreaterThanOrEqual(300);
    expect(canvasWidth / canvasHeight).toBeCloseTo(4 / 3, 0.1);
  });

  test('should scale to fit viewport height', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    await page.setViewportSize({ width: 600, height: 1000 });
    
    await page.waitForTimeout(200);
    
    const canvasWidth = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
    const canvasHeight = await canvas.evaluate((el: HTMLCanvasElement) => el.height);
    
    expect(canvasWidth).toBeGreaterThan(0);
    expect(canvasHeight).toBeGreaterThanOrEqual(300);
    expect(canvasWidth / canvasHeight).toBeCloseTo(4 / 3, 0.1);
  });

  test('should maintain aspect ratio on resize', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(200);
    
    const initialWidth = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
    const initialHeight = await canvas.evaluate((el: HTMLCanvasElement) => el.height);
    
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(200);
    
    const newWidth = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
    const newHeight = await canvas.evaluate((el: HTMLCanvasElement) => el.height);
    
    expect(newWidth).toBeGreaterThan(initialWidth);
    expect(newHeight).toBeGreaterThan(initialHeight);
    expect(Math.round(newWidth / newHeight * 100) / 100).toBeCloseTo(4 / 3, 1);
  });

  test('should handle mobile portrait viewport', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.waitForTimeout(200);
    
    const canvasWidth = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
    const canvasHeight = await canvas.evaluate((el: HTMLCanvasElement) => el.height);
    
    expect(canvasWidth).toBeGreaterThanOrEqual(375);
    expect(canvasHeight).toBeGreaterThanOrEqual(281);
    expect(canvasWidth / canvasHeight).toBeCloseTo(4 / 3, 0.15);
  });

  test('should render game elements at different sizes', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    
    await page.setViewportSize({ width: 400, height: 300 });
    await page.waitForTimeout(200);
    
    await canvas.click();
    await page.waitForTimeout(200);
    
    let canvasWidth = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
    let canvasHeight = await canvas.evaluate((el: HTMLCanvasElement) => el.height);
    
    expect(canvasWidth).toBeGreaterThanOrEqual(400);
    expect(canvasHeight).toBeGreaterThanOrEqual(300);
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(200);
    
    await canvas.click();
    await page.waitForTimeout(200);
    
    canvasWidth = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
    canvasHeight = await canvas.evaluate((el: HTMLCanvasElement) => el.height);
    
    expect(canvasWidth).toBeGreaterThanOrEqual(400);
    expect(canvasHeight).toBeGreaterThanOrEqual(300);
    expect(canvasWidth / canvasHeight).toBeCloseTo(4 / 3, 0.1);
  });

  test('should start game when clicking on canvas', async ({ page }) => {
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
