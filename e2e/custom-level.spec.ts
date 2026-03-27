import { test, expect } from '@playwright/test';

test.describe('Custom Level Integration', () => {
  test('should allow playing custom level from editor', async ({ page }) => {
    // Navigate to editor
    await page.goto('/editor');
    
    // Create a simple level by clicking on grid cells
    const canvas = page.locator('#editorCanvas');
    
    // Click several cells to create bricks
    for (let i = 0; i < 6; i++) {
      const x = 100 + (i % 3) * 90;
      const y = 50 + Math.floor(i / 3) * 40;
      await canvas.click({ x, y, position: { x: 45, y: 20 } });
    }
    
    // Click Play Level button
    await page.getByRole('button', { name: /▶️ Play Level/i }).click();
    
    // Verify we're now on the game page with customLevel parameter
    await expect(page).toHaveURL(/\/\?customLevel=/);
    
    // Verify the customLevel parameter exists
    const url = new URL(page.url());
    const customLevel = url.searchParams.get('customLevel');
    expect(customLevel).toBeTruthy();
    
    // Verify we can decode the level config
    const decoded = JSON.parse(atob(customLevel!));
    expect(decoded).toHaveProperty('rows');
    expect(decoded).toHaveProperty('cols');
    expect(decoded).toHaveProperty('colors');
  });
  
  test('should display custom level when loaded', async ({ page }) => {
    // Create a custom level config
    const customConfig = {
      rows: 4,
      cols: 6,
      offsetTop: 60,
      offsetLeft: 30,
      padding: 10,
      brickHeight: 25,
      colors: ['#ff0044', '#ff6600'],
      ballSpeed: 5,
      powerUpSpawnRate: 5,
    };
    
    const encoded = btoa(JSON.stringify(customConfig));
    
    // Navigate to game with custom level
    await page.goto(`/?customLevel=${encoded}`);
    
    // Wait for menu to load
    await page.waitForTimeout(500);
    
    // Start the game by clicking anywhere
    await page.click('canvas');
    
    // Wait for game to start
    await page.waitForTimeout(1000);
    
    // Verify canvas is visible (game is running)
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();
  });
});
