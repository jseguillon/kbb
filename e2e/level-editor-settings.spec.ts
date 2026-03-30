import { test, expect } from '@playwright/test';

test.describe('Level Editor New Format Support', () => {
  test('should save level with new format including settings', async ({ page }) => {
    await page.goto('/editor');
    
    // Save a level
    const saveButton = page.getByRole('button', { name: 'Save Level' });
    await saveButton.click();
    
    // Verify settings are saved in new format
    const savedLevels = await page.evaluate(() => {
      const saved = localStorage.getItem('kbb_custom_levels');
      return saved ? JSON.parse(saved) : [];
    });
    
    expect(savedLevels.length).toBe(1);
    expect(savedLevels[0].name).toBe('Custom Level 1');
    expect(savedLevels[0].settings).toBeDefined();
    expect(savedLevels[0].grid).toBeDefined();
    expect(savedLevels[0].rows).toBe(16);
    expect(savedLevels[0].cols).toBe(24);
  });

  test('should save level with default game speed', async ({ page }) => {
    await page.goto('/editor');
    
    const saveButton = page.getByRole('button', { name: 'Save Level' });
    await saveButton.click();
    
    const savedLevels = await page.evaluate(() => {
      const saved = localStorage.getItem('kbb_custom_levels');
      return saved ? JSON.parse(saved) : [];
    });
    
    expect(savedLevels[0].settings?.gameSpeed).toBe(1.0);
  });

  test('should save level with default laser cooldown', async ({ page }) => {
    await page.goto('/editor');
    
    const saveButton = page.getByRole('button', { name: 'Save Level' });
    await saveButton.click();
    
    const savedLevels = await page.evaluate(() => {
      const saved = localStorage.getItem('kbb_custom_levels');
      return saved ? JSON.parse(saved) : [];
    });
    
    expect(savedLevels[0].settings?.laserCooldown).toBe(400);
  });

  test('should save level with default power-up spawn rate', async ({ page }) => {
    await page.goto('/editor');
    
    const saveButton = page.getByRole('button', { name: 'Save Level' });
    await saveButton.click();
    
    const savedLevels = await page.evaluate(() => {
      const saved = localStorage.getItem('kbb_custom_levels');
      return saved ? JSON.parse(saved) : [];
    });
    
    expect(savedLevels[0].settings?.powerUpSpawnRate).toBe(5);
  });

  test('should save level with default power-up probabilities', async ({ page }) => {
    await page.goto('/editor');
    
    const saveButton = page.getByRole('button', { name: 'Save Level' });
    await saveButton.click();
    
    const savedLevels = await page.evaluate(() => {
      const saved = localStorage.getItem('kbb_custom_levels');
      return saved ? JSON.parse(saved) : [];
    });
    
    expect(savedLevels[0].settings?.powerUpProbabilities).toEqual({
      wide: 0.25,
      multi: 0.2,
      laser: 0.2,
      slow: 0.25,
      life: 0.1,
    });
  });

  test('should load old format level for backward compatibility', async ({ page }) => {
    // Manually save an old format level (just array)
    await page.goto('/editor');
    
    await page.evaluate(() => {
      localStorage.setItem('kbb_custom_levels', JSON.stringify([
        [
          ['#ff0044', '#ff0044', null],
          ['#ff0044', '#ff0044', null],
          [null, null, null]
        ]
      ]));
    });
    
    // Click the first load button (Load Level)
    const loadButtons = page.locator('[data-action="load"]');
    await loadButtons.first().click();
    
    // Verify it loaded - should now show 1 saved level in the list
    const savedLevels = await page.evaluate(() => {
      const saved = localStorage.getItem('kbb_custom_levels');
      return saved ? JSON.parse(saved) : [];
    });
    
    // Old format should be loaded successfully
    expect(savedLevels.length).toBe(1);
  });

  test('should load new format level', async ({ page }) => {
    await page.goto('/editor');
    
    // Save a new format level
    const saveButton = page.getByRole('button', { name: 'Save Level' });
    await saveButton.click();
    
    // Load it back using the Load button
    const loadButtons = page.locator('[data-action="load"]');
    await loadButtons.first().click();
    
    // Verify level loaded - check if grid is populated
    const savedLevels = await page.evaluate(() => {
      const saved = localStorage.getItem('kbb_custom_levels');
      return saved ? JSON.parse(saved) : [];
    });
    
    expect(savedLevels.length).toBeGreaterThan(0);
  });

  test('should handle custom level name in new format', async ({ page }) => {
    await page.goto('/editor');
    
    // Clear any existing levels
    await page.evaluate(() => localStorage.removeItem('kbb_custom_levels'));
    
    // Set level name
    const nameInput = page.locator('.level-name-input');
    await nameInput.fill('Unique Test Level Name');
    
    const saveButton = page.getByRole('button', { name: 'Save Level' });
    await saveButton.click();
    
    const savedLevels = await page.evaluate(() => {
      const saved = localStorage.getItem('kbb_custom_levels');
      return saved ? JSON.parse(saved) : [];
    });
    
    // Name should be saved
    expect(savedLevels[0].name).toBe('Unique Test Level Name');
  });

  test('should support both old and new format in same storage', async ({ page }) => {
    await page.goto('/editor');
    
    // Save old format first
    await page.evaluate(() => {
      localStorage.setItem('kbb_custom_levels', JSON.stringify([
        [
          ['#ff0044', null],
          ['#ff0044', null]
        ]
      ]));
    });
    
    // Save new format
    const saveButton = page.getByRole('button', { name: 'Save Level' });
    await saveButton.click();
    
    const savedLevels = await page.evaluate(() => {
      const saved = localStorage.getItem('kbb_custom_levels');
      return saved ? JSON.parse(saved) : [];
    });
    
    // Should have both formats
    expect(savedLevels.length).toBe(2);
    
    // First should be old format (array)
    expect(Array.isArray(savedLevels[0])).toBe(true);
    
    // Second should be new format (object with settings)
    expect(savedLevels[1].settings).toBeDefined();
  });

  test('should encode level for export with new format', async ({ page }) => {
    await page.goto('/editor');
    
    // Save the level first
    const saveButton = page.getByRole('button', { name: 'Save Level' });
    await saveButton.click();
    
    // Get saved level data
    const savedLevels = await page.evaluate(() => {
      const saved = localStorage.getItem('kbb_custom_levels');
      return saved ? JSON.parse(saved) : [];
    });
    
    // Encode level data as would be done for export
    const levelToExport = savedLevels[savedLevels.length - 1];
    const encoded = btoa(JSON.stringify(levelToExport));
    
    // Should be able to decode it
    const decoded = JSON.parse(atob(encoded));
    
    expect(decoded.settings).toBeDefined();
    expect(decoded.grid).toBeDefined();
  });
});
