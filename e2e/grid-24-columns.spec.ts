import { test, expect } from '@playwright/test';

test.describe('24-Column Grid Tests', () => {
  test('should have 24 columns in level editor', async ({ page }) => {
    await page.goto('/editor');
    
    const canvas = page.locator('#editorCanvas');
    const box = await canvas.boundingBox();
    
    // With 24 columns at 30px width + 3px padding = 33px per cell
    // Total width should be approximately 24 * 33 = 792px
    expect(box?.width).toBeGreaterThan(700);
    
    // Verify footer shows 24 columns
    await expect(page.getByText('Grid: 24 columns')).toBeVisible();
  });
  
  test('should place bricks across full 24-column width', async ({ page }) => {
    // Create a pattern with bricks at edges
    const edgePattern = {
      rows: 1,
      cols: 24,
      offsetTop: 60,
      offsetLeft: 30,
      padding: 10,
      brickHeight: 25,
      colors: ['#ff0044'],
      ballSpeed: 5,
      powerUpSpawnRate: 5,
      grid: [
        ['#ff0044', ...Array(22).fill(null), '#ff0044'], // red at both edges
      ],
    };
    
    const encoded = btoa(JSON.stringify(edgePattern));
    await page.goto(`/?customLevel=${encoded}`);
    
    await page.waitForTimeout(500);
    
    const url = new URL(page.url());
    const decoded = JSON.parse(atob(url.searchParams.get('customLevel')!));
    
    expect(decoded.cols).toBe(24);
    expect(decoded.grid[0]).toHaveLength(24);
    
    // Verify bricks at edges
    expect(decoded.grid[0][0]).toBe('#ff0044'); // left edge
    expect(decoded.grid[0][23]).toBe('#ff0044'); // right edge
  });
  
  test('should render wide level in game', async ({ page }) => {
    // Create a wide pattern with 24 columns
    const widePattern = {
      rows: 3,
      cols: 24,
      offsetTop: 60,
      offsetLeft: 30,
      padding: 10,
      brickHeight: 25,
      colors: ['#ff0044', '#0066ff', '#ff6600'],
      ballSpeed: 5,
      powerUpSpawnRate: 5,
      grid: [
        ...Array(24).fill(null).map((_, i) => i % 3 === 0 ? '#ff0044' : null), // row 0: red every 3rd
        ...Array(24).fill(null).map((_, i) => i % 3 === 1 ? '#0066ff' : null), // row 1: blue every 3rd
        ...Array(24).fill(null).map((_, i) => i % 3 === 2 ? '#ff6600' : null), // row 2: orange every 3rd
      ],
    };
    
    const encoded = btoa(JSON.stringify(widePattern));
    await page.goto(`/?customLevel=${encoded}`);
    
    await page.waitForTimeout(500);
    
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();
    
    // Verify canvas is wider than before
    const box = await canvas.boundingBox();
    expect(box?.width).toBeGreaterThan(800);
  });
  
  test('should handle level with bricks at all 24 columns', async ({ page }) => {
    // Create a level with bricks in every column
    const fullPattern = {
      rows: 2,
      cols: 24,
      offsetTop: 60,
      offsetLeft: 30,
      padding: 10,
      brickHeight: 25,
      colors: ['#ff0044'],
      ballSpeed: 5,
      powerUpSpawnRate: 5,
      grid: [
        Array(24).fill('#ff0044'), // row 0: all red
        Array(24).fill('#0066ff'), // row 1: all blue
      ],
    };
    
    const encoded = btoa(JSON.stringify(fullPattern));
    await page.goto(`/?customLevel=${encoded}`);
    
    await page.waitForTimeout(500);
    
    const url = new URL(page.url());
    const decoded = JSON.parse(atob(url.searchParams.get('customLevel')!));
    
    // Verify all 24 columns have bricks
    expect(decoded.grid[0]).toHaveLength(24);
    expect(decoded.grid[0].filter(c => c !== null)).toHaveLength(24);
    expect(decoded.grid[1]).toHaveLength(24);
    expect(decoded.grid[1].filter(c => c !== null)).toHaveLength(24);
  });
});
