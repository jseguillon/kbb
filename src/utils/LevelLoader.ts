import type { LevelConfig } from '../logic/LevelManager';

export type ParsedLevel = {
  name: string;
  grid: (string | null)[][];
  colors: string[];
};

export class LevelLoader {
  private levelsDir = '/src/levels/';

  async loadLevelFromFile(filePath: string): Promise<ParsedLevel | null> {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load level: ${response.statusText}`);
      }
      const grid = await response.json();
      const colors = this.extractColors(grid);
      const name = this.extractNameFromPath(filePath);
      
      return { name, grid, colors };
    } catch (error) {
      console.error(`Error loading level from ${filePath}:`, error);
      return null;
    }
  }

  async loadLevelById(levelId: number): Promise<ParsedLevel | null> {
    const filePath = `${this.levelsDir}${levelId}.json`;
    return this.loadLevelFromFile(filePath);
  }

  async listAvailableLevels(): Promise<Array<{ id: number; name: string }>> {
    const levels = [];
    for (let i = 1; i <= 100; i++) {
      const level = await this.loadLevelById(i);
      if (level) {
        levels.push({ id: i, name: level.name });
      } else {
        break;
      }
    }
    return levels;
  }

  private extractColors(grid: (string | null)[][]): string[] {
    const colorSet = new Set<string>();
    for (const row of grid) {
      for (const cell of row) {
        if (cell !== null) {
          colorSet.add(cell);
        }
      }
    }
    return Array.from(colorSet);
  }

  private extractNameFromPath(filePath: string): string {
    const filename = filePath.split('/').pop() || 'Custom Level';
    return filename.replace('.json', '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  parseLevelToConfig(parsedLevel: ParsedLevel, customSettings?: Partial<LevelConfig>): LevelConfig {
    const rows = parsedLevel.grid.length;
    const cols = parsedLevel.grid[0]?.length || 0;
    
    const defaultSettings: LevelConfig = {
      rows,
      cols,
      offsetTop: 60,
      offsetLeft: 30,
      padding: 10,
      brickHeight: 25,
      colors: parsedLevel.colors,
      ballSpeed: 5,
      powerUpSpawnRate: 5,
      grid: parsedLevel.grid,
    };

    return { ...defaultSettings, ...customSettings };
  }
}
