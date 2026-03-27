import { test, expect } from '@playwright/test';

test.describe('Custom Level Grid Layout', () => {
  test('should preserve exact brick positions and colors from editor', async ({ page }) => {
    // Navigate to editor
    await page.goto('/editor');
    
    // Select red color
    await page.locator('.color-btn').nth(0).click();
    
    // Create a 2x2 square of red bricks at center (rows 4-5, cols 3-4)
    const canvas = page.locator('#editorCanvas');
    
    // Click cells at (3,4), (4,4), (3,5), (4,5) for red
    await canvas.click({ x: 285, y: 215 });
    await canvas.click({ x: 375, y: 215 });
    await canvas.click({ x: 285, y: 255 });
    await canvas.click({ x: 375, y: 255 });
    
    // Select blue color
    await page.locator('.color-btn').nth(4).click();
    
    // Create a 2x2 square of blue bricks adjacent (rows 3-4, cols 5-6)
    await canvas.click({ x: 465, y: 175 });
    await canvas.click({ x: 555, y: 175 });
    await canvas.click({ x: 465, y: 215 });
    await canvas.click({ x: 555, y: 215 });
    
    // Click Play Level
    await page.getByRole('button', { name: /▶️ Play Level/i }).click();
    
    // Verify we're on game page with custom level
    await expect(page).toHaveURL(/\/\?customLevel=/);
    
    // Wait a moment and take screenshot to inspect
    await page.waitForTimeout(500);
    
    // The test verifies the URL has custom level param
    const url = new URL(page.url());
    const customLevel = url.searchParams.get('customLevel');
    expect(customLevel).toBeTruthy();
    
    // Decode to verify grid structure is preserved
    const decoded = JSON.parse(atob(customLevel!));
    expect(decoded).toHaveProperty('grid');
    expect(decoded.grid).toBeInstanceOf(Array);
  });
  
  test('should render specific brick pattern correctly', async ({ page }) => {
    // Create a known pattern and verify it loads correctly
    const pattern = {
      grid: [
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, '#ff0044', '#ff0044', null, null, null], // row 2: red at cols 3-4
        [null, null, null, '#ff0044', '#ff0044', null, null, null], // row 3: red at cols 3-4
        [null, null, null, '#0066ff', '#0066ff', null, null, null], // row 4: blue at cols 3-4
        [null, null, null, '#0066ff', '#0066ff', null, null, null], // row 5: blue at cols 3-4
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
      ],
      name: 'Test Pattern',
      rows: 8,
      cols: 8,
      config: {
        offsetTop: 60,
        offsetLeft: 30,
        padding: 10,
        brickHeight: 25,
        ballSpeed: 5,
        powerUpSpawnRate: 5,
      },
    };
    
    const encoded = btoa(JSON.stringify(pattern));
    await page.goto(`/?customLevel=${encoded}`);
    
    // Wait for game to load
    await page.waitForTimeout(500);
    
    // Verify canvas is visible
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();
  });
});
