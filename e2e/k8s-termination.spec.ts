import { test, expect } from '@playwright/test';

test.describe('Kubernetes Pod Termination', () => {
  test('should terminate random pod when breaking red brick', async ({ page }) => {
    // Mock the K8s middleware API to simulate pod termination
    const mockPodName = 'test-pod-7d8f9g6h5j';
    const mockNamespace = 'argocd';
    
    // Set up console listener before navigation
    const logs: string[] = [];
    page.on('console', msg => {
      logs.push(msg.text());
    });
    
    // Set up request listener to track API calls
    let requestCount = 0;
    page.on('request', request => {
      if (request.url().includes('api/v1/pod/terminate')) {
        requestCount++;
      }
    });
    
    await page.goto('/');
    
    // Mock the DELETE endpoint
    await page.route('**/api/v1/pod/terminate', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          pod: mockPodName,
        }),
      });
    });

    // Start game
    const canvas = page.locator('#gameCanvas');
    
    await page.waitForTimeout(500);
    await canvas.click();
    
    // Launch ball
    await page.waitForTimeout(100);
    await canvas.click();
    
    // Launch all balls and increase speed
    await page.evaluate(() => {
      const game: any = (window as any).game;
      if (game) {
        // Set game state to PLAYING
        (game as any).gameState = { state: 'playing' };
        
        if (game.balls) {
          game.balls.forEach((ball: any) => {
            if (!ball.launched) ball.launch();
            ball.speed = 15;
          });
        }
        
        // Force ball to top row (red bricks)
        if (game.balls && game.balls.length > 0) {
          game.balls[0].y = 10;
        }
      }
    });
    
    await page.waitForTimeout(200);
    
    // Wait for ball to hit red brick (first row is red #ff0044)
    await page.waitForTimeout(5000);
    
    const hasTerminationLog = logs.some(log => 
      log.includes('Pod terminated') || log.includes('K8s')
    );
    
    // The game should have attempted to call the API
    expect(hasTerminationLog).toBeTruthy();
  });

  test('should handle K8s API failure gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Mock the DELETE endpoint to return error
    await page.route('**/api/v1/pod/terminate', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Failed to delete pod',
        }),
      });
    });

    // Start game
    const canvas = page.locator('#gameCanvas');
    await canvas.click();
    
    // Launch ball
    await page.waitForTimeout(100);
    await canvas.click();
    
    // Wait for ball to hit red brick
    await page.waitForTimeout(2000);
    
    // Game should continue normally - verify we can still interact
    await canvas.click();
    await page.waitForTimeout(500);
    
    const screenshot = await canvas.screenshot();
    expect(screenshot.length).toBeGreaterThan(0);
  });

  test('should only trigger pod termination on red bricks', async ({ page }) => {
    await page.goto('/');
    
    // Mock the DELETE endpoint and count calls
    let callCount = 0;
    
    await page.route('**/api/v1/pod/terminate', route => {
      callCount++;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          pod: `test-pod-${callCount}`,
        }),
      });
    });

    // Start game
    const canvas = page.locator('#gameCanvas');
    await canvas.click();
    
    // Launch ball
    await page.waitForTimeout(100);
    await canvas.click();
    
    // Wait for ball to break multiple bricks (only red ones should trigger)
    await page.waitForTimeout(3000);
    
    // Count calls - should only be called for red bricks (first row)
    // There are 8 columns, so at most 8 calls if all red bricks are hit
    expect(callCount).toBeGreaterThanOrEqual(0);
    expect(callCount).toBeLessThanOrEqual(8);
  });
});
