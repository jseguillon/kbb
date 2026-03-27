import type { LevelConfig } from './LevelManager';

export type GridCell = string | null; // color or null (empty)

export type EditorLevel = {
  name: string;
  grid: GridCell[][];
  rows: number;
  cols: number;
  settings?: {
    gameSpeed?: number;
    laserCooldown?: number;
    powerUpSpawnRate?: number;
    powerUpProbabilities?: {
      wide: number;
      multi: number;
      laser: number;
      slow: number;
      life: number;
    };
  };
};

export class LevelEditorManager {
  private gridSize: { rows: number; cols: number };
  private grid: GridCell[][];
  private currentLevelName: string = 'Custom Level 1';

  constructor(initialRows: number = 16, initialCols: number = 24) {
    this.gridSize = { rows: initialRows, cols: initialCols };
    this.grid = this.createEmptyGrid();
  }

  private createEmptyGrid(): GridCell[][] {
    return Array(this.gridSize.rows).fill(null).map(() => 
      Array(this.gridSize.cols).fill(null)
    );
  }

  reset(): void {
    this.grid = this.createEmptyGrid();
  }

  setCell(row: number, col: number, color: string | null): void {
    if (row >= 0 && row < this.gridSize.rows && col >= 0 && col < this.gridSize.cols) {
      this.grid[row][col] = color;
    }
  }

  getCell(row: number, col: number): string | null {
    if (row >= 0 && row < this.gridSize.rows && col >= 0 && col < this.gridSize.cols) {
      return this.grid[row][col];
    }
    return null;
  }

  getGrid(): GridCell[][] {
    return this.grid.map(row => [...row]);
  }

  toLevelConfig(): LevelConfig {
    // Find all used colors
    const usedColors = new Set<string>();
    for (let r = 0; r < this.gridSize.rows; r++) {
      for (let c = 0; c < this.gridSize.cols; c++) {
        const cell = this.grid[r][c];
        if (cell !== null) {
          usedColors.add(cell);
        }
      }
    }

    const colors = Array.from(usedColors);
    const maxRow = this.getMaxFilledRow();

    // Create grid with only filled rows
    const filledGrid: (string | null)[][] = [];
    for (let r = 0; r <= maxRow; r++) {
      filledGrid.push(this.grid[r].map(cell => cell));
    }

    return {
      rows: filledGrid.length,
      cols: this.gridSize.cols,
      offsetTop: 60,
      offsetLeft: 30,
      padding: 10,
      brickHeight: 25,
      colors: colors.length > 0 ? colors : ['#ff0044'],
      ballSpeed: 5,
      powerUpSpawnRate: 5,
      powerUpProbabilities: {
        wide: 0.25,
        multi: 0.2,
        laser: 0.2,
        slow: 0.25,
        life: 0.1,
      },
      gameSpeed: 1.0,
      laserCooldown: 400,
      grid: filledGrid,
    };
  }

  private getMaxFilledRow(): number {
    for (let r = this.gridSize.rows - 1; r >= 0; r--) {
      for (let c = 0; c < this.gridSize.cols; c++) {
        const cell = this.grid[r][c];
        if (cell !== null) {
          return r;
        }
      }
    }
    return 0;
  }

  fromLevelConfig(config: LevelConfig): void {
    this.grid = this.createEmptyGrid();
    
    // If grid is provided, use it directly
    if (config.grid && config.grid.length > 0) {
      for (let r = 0; r < Math.min(config.rows, this.gridSize.rows); r++) {
        for (let c = 0; c < Math.min(config.cols, this.gridSize.cols); c++) {
          this.grid[r][c] = config.grid[r][c] ?? null;
        }
      }
    } else {
      // Fallback to color cycling for old configs without grid
      for (let r = 0; r < Math.min(config.rows, this.gridSize.rows); r++) {
        for (let c = 0; c < Math.min(config.cols, this.gridSize.cols); c++) {
          const color = config.colors[r % config.colors.length];
          this.grid[r][c] = color;
        }
      }
    }
  }

  setLevelName(name: string): void {
    this.currentLevelName = name;
  }

  getLevelName(): string {
    return this.currentLevelName;
  }

  getGridSize(): { rows: number; cols: number } {
    return this.gridSize;
  }

  saveLevel(index: number): void {
    const levelData: EditorLevel = {
      name: this.currentLevelName,
      grid: this.getGrid(),
      rows: this.gridSize.rows,
      cols: this.gridSize.cols,
      settings: {
        gameSpeed: 1.0,
        laserCooldown: 400,
        powerUpSpawnRate: 5,
        powerUpProbabilities: {
          wide: 0.25,
          multi: 0.2,
          laser: 0.2,
          slow: 0.25,
          life: 0.1,
        },
      },
    };

    const levels = this.getSavedLevels();
    levels[index] = levelData;
    localStorage.setItem('kbb_custom_levels', JSON.stringify(levels));
  }

  getSavedLevels(): EditorLevel[] {
    const saved = localStorage.getItem('kbb_custom_levels');
    return saved ? JSON.parse(saved) : [];
  }

  loadLevel(index: number): boolean {
    const levels = this.getSavedLevels();
    if (index >= 0 && index < levels.length) {
      const level = levels[index];
      
      // Support both old array format and new object format
      if (Array.isArray(level)) {
        // Old format: just the grid array
        this.gridSize = { rows: level.length, cols: level[0]?.length || 24 };
        this.grid = level.map(row => [...row]);
        this.currentLevelName = 'Custom Level';
      } else {
        // New format: object with grid and settings
        this.gridSize = { rows: level.rows, cols: level.cols };
        this.grid = level.grid.map(row => [...row]);
        this.currentLevelName = level.name || 'Custom Level';
      }
      return true;
    }
    return false;
  }

  deleteLevel(index: number): void {
    const levels = this.getSavedLevels();
    levels.splice(index, 1);
    localStorage.setItem('kbb_custom_levels', JSON.stringify(levels));
  }

  getCustomLevelsCount(): number {
    return this.getSavedLevels().length;
  }
}
