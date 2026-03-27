import { test, expect } from '@playwright/test';

test.describe('Custom Level Grid Layout - Precise', () => {
  test('should preserve exact 2x2 red and 2x2 blue brick pattern', async ({ page }) => {
    // Create a precise pattern: 2x2 red at top, 2x2 blue below it
    const pattern = {
      rows: 4,
      cols: 8,
      offsetTop: 60,
      offsetLeft: 30,
      padding: 10,
      brickHeight: 25,
      colors: ['#ff0044', '#0066ff'],
      ballSpeed: 5,
      powerUpSpawnRate: 5,
      grid: [
        [null, null, null, '#ff0044', '#ff0044', null, null, null], // row 0: red at cols 3-4
        [null, null, null, '#ff0044', '#ff0044', null, null, null], // row 1: red at cols 3-4
        [null, null, null, '#0066ff', '#0066ff', null, null, null], // row 2: blue at cols 3-4
        [null, null, null, '#0066ff', '#0066ff', null, null, null], // row 3: blue at cols 3-4
      ],
    };
    
    const encoded = btoa(JSON.stringify(pattern));
    await page.goto(`/?customLevel=${encoded}`);
    
    // Wait for game to load
    await page.waitForTimeout(500);
    
    // Verify canvas is visible
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();
    
    // Decode and verify the pattern is preserved exactly
    const url = new URL(page.url());
    const decoded = JSON.parse(atob(url.searchParams.get('customLevel')!));
    
    // Verify grid structure
    expect(decoded).toHaveProperty('grid');
    expect(decoded.grid).toBeInstanceOf(Array);
    expect(decoded.grid.length).toBe(4); // 4 rows
    expect(decoded.cols).toBe(8); // 8 columns
    
    // Verify colors array has both red and blue
    expect(decoded.colors).toContain('#ff0044'); // red
    expect(decoded.colors).toContain('#0066ff'); // blue
    
    // Verify exact brick positions - red 2x2 at top
    expect(decoded.grid[0][3]).toBe('#ff0044');
    expect(decoded.grid[0][4]).toBe('#ff0044');
    expect(decoded.grid[1][3]).toBe('#ff0044');
    expect(decoded.grid[1][4]).toBe('#ff0044');
    
    // Verify exact brick positions - blue 2x2 below
    expect(decoded.grid[2][3]).toBe('#0066ff');
    expect(decoded.grid[2][4]).toBe('#0066ff');
    expect(decoded.grid[3][3]).toBe('#0066ff');
    expect(decoded.grid[3][4]).toBe('#0066ff');
    
    // Verify empty cells are null
    expect(decoded.grid[0][0]).toBeNull();
    expect(decoded.grid[0][1]).toBeNull();
    expect(decoded.grid[0][2]).toBeNull();
    expect(decoded.grid[0][5]).toBeNull();
    expect(decoded.grid[0][6]).toBeNull();
    expect(decoded.grid[0][7]).toBeNull();
  });
  
  test('should render checkerboard pattern with swapped colors', async ({ page }) => {
    // Create a checkerboard pattern where colors swap per cell
    const pattern = {
      rows: 4,
      cols: 8,
      offsetTop: 60,
      offsetLeft: 30,
      padding: 10,
      brickHeight: 25,
      colors: ['#ff0044', '#ff6600'],
      ballSpeed: 5,
      powerUpSpawnRate: 5,
      grid: [
        [null, null, null, null, null, null, null, null],
        [null, null, null, '#ff0044', '#ff6600', null, null, null], // row 1: red then orange
        [null, null, null, '#ff6600', '#ff0044', null, null, null], // row 2: orange then red (swapped!)
        [null, null, null, null, null, null, null, null],
      ],
    };
    
    const encoded = btoa(JSON.stringify(pattern));
    await page.goto(`/?customLevel=${encoded}`);
    
    await page.waitForTimeout(500);
    
    const url = new URL(page.url());
    const decoded = JSON.parse(atob(url.searchParams.get('customLevel')!));
    
    // Verify the checker pattern is preserved - colors swapped between rows
    expect(decoded.grid[1][3]).toBe('#ff0044'); // red
    expect(decoded.grid[1][4]).toBe('#ff6600'); // orange
    expect(decoded.grid[2][3]).toBe('#ff6600'); // orange (swapped!)
    expect(decoded.grid[2][4]).toBe('#ff0044'); // red (swapped!)
  });
  
  test('should handle sparse grid with intentional gaps', async ({ page }) => {
    // Create a pattern with gaps (null cells between bricks)
    const pattern = {
      rows: 4,
      cols: 8,
      offsetTop: 60,
      offsetLeft: 30,
      padding: 10,
      brickHeight: 25,
      colors: ['#ff0044', '#ff6600'],
      ballSpeed: 5,
      powerUpSpawnRate: 5,
      grid: [
        [null, '#ff0044', null, '#ff6600', null, null, null, null], // row 0: red, gap, orange
        [null, null, null, null, null, null, null, null], // row 1: all empty
        [null, '#ff0044', null, '#ff6600', null, null, null, null], // row 2: red, gap, orange
        [null, null, null, null, null, null, null, null], // row 3: all empty
      ],
    };
    
    const encoded = btoa(JSON.stringify(pattern));
    await page.goto(`/?customLevel=${encoded}`);
    
    await page.waitForTimeout(500);
    
    const url = new URL(page.url());
    const decoded = JSON.parse(atob(url.searchParams.get('customLevel')!));
    
    // Verify gaps are preserved (null values)
    expect(decoded.grid[0][0]).toBeNull();
    expect(decoded.grid[0][2]).toBeNull(); // gap between red and orange
    expect(decoded.grid[0][4]).toBeNull();
    expect(decoded.grid[1][0]).toBeNull();
    
    // Verify bricks are at correct positions
    expect(decoded.grid[0][1]).toBe('#ff0044');
    expect(decoded.grid[0][3]).toBe('#ff6600');
    expect(decoded.grid[2][1]).toBe('#ff0044');
    expect(decoded.grid[2][3]).toBe('#ff6600');
  });
});
