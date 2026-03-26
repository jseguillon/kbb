import { describe, it, expect, beforeEach } from 'vitest';
import { LevelEditorManager, type GridCell } from '../logic/LevelEditorManager';

describe('LevelEditorManager', () => {
  let manager: LevelEditorManager;

  beforeEach(() => {
    manager = new LevelEditorManager(16, 8);
  });

  describe('grid initialization', () => {
    it('should create empty grid with correct dimensions', () => {
      const grid = manager.getGrid();
      expect(grid).toHaveLength(16);
      expect(grid[0]).toHaveLength(8);
      expect(grid[0][0]).toBeNull();
    });

    it('should reset grid to empty state', () => {
      manager.setCell(0, 0, '#ff0000');
      manager.reset();
      const grid = manager.getGrid();
      expect(grid[0][0]).toBeNull();
    });
  });

  describe('cell manipulation', () => {
    it('should set and get cell value', () => {
      manager.setCell(2, 3, '#00ff00');
      expect(manager.getCell(2, 3)).toBe('#00ff00');
    });

    it('should handle boundary conditions', () => {
      manager.setCell(0, 0, '#ff0000');
      expect(manager.getCell(0, 0)).toBe('#ff0000');
      
      // Out of bounds should return null
      expect(manager.getCell(20, 10)).toBeNull();
      expect(manager.getCell(-1, 0)).toBeNull();
    });

    it('should allow setting null to remove brick', () => {
      manager.setCell(5, 5, '#ff0000');
      expect(manager.getCell(5, 5)).toBe('#ff0000');
      
      manager.setCell(5, 5, null);
      expect(manager.getCell(5, 5)).toBeNull();
    });
  });

  describe('toLevelConfig', () => {
    it('should generate config from filled grid', () => {
      manager.setCell(0, 0, '#ff0000');
      manager.setCell(1, 0, '#00ff00');
      
      const config = manager.toLevelConfig();
      expect(config.rows).toBeGreaterThanOrEqual(1);
      expect(config.cols).toBe(8);
      expect(config.colors).toContain('#ff0000');
      expect(config.colors).toContain('#00ff00');
    });

    it('should handle empty grid', () => {
      const config = manager.toLevelConfig();
      expect(config.rows).toBe(1);
      expect(config.colors).toContain('#ff0044');
    });
  });

  describe('level name', () => {
    it('should set and get level name', () => {
      expect(manager.getLevelName()).toBe('Custom Level 1');
      
      manager.setLevelName('My Custom Level');
      expect(manager.getLevelName()).toBe('My Custom Level');
    });
  });

  describe('grid size', () => {
    it('should return correct grid size', () => {
      const size = manager.getGridSize();
      expect(size.rows).toBe(16);
      expect(size.cols).toBe(8);
    });

    it('should support custom grid size', () => {
      const customManager = new LevelEditorManager(10, 12);
      const size = customManager.getGridSize();
      expect(size.rows).toBe(10);
      expect(size.cols).toBe(12);
    });
  });
});
