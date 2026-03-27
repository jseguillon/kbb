import type { LevelConfig } from '../logic/LevelManager';

export type ParsedLevel = {
  name: string;
  grid: (string | null)[][];
  colors: string[];
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

export class LevelLoader {
  private levelsDir = '/src/levels/';

  async loadLevelFromFile(filePath: string): Promise<ParsedLevel | null> {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load level: ${response.status} ${response.statusText}`);
      }
      
      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Invalid content type: ${contentType}`);
      }
      
      const data = await response.json();
      
      let grid: (string | null)[][];
      let settings;
      
      if (Array.isArray(data)) {
        grid = data;
        settings = undefined;
      } else {
        grid = data.grid || data;
        settings = data.settings;
      }
      
      if (!grid || !Array.isArray(grid)) {
        throw new Error('Invalid grid format in level file');
      }
      
      const colors = this.extractColors(grid);
      const name = this.extractNameFromPath(filePath);
      
      console.log(`Level loaded successfully: ${filePath}`, { name, rows: grid.length, cols: grid[0]?.length, colors });
      
      return { name, grid, colors, settings };
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
      try {
        const response = await fetch(`${this.levelsDir}${i}.json`);
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
          break;
        }
        const name = this.extractNameFromPath(`${this.levelsDir}${i}.json`);
        levels.push({ id: i, name });
      } catch (error) {
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
      powerUpProbabilities: {
        wide: 0.25,
        multi: 0.2,
        laser: 0.2,
        slow: 0.25,
        life: 0.1,
      },
      gameSpeed: 1.0,
      laserCooldown: 400,
      grid: parsedLevel.grid,
    };

    const settings = parsedLevel.settings || {};
    
    const mergedSettings: LevelConfig = {
      ...defaultSettings,
      gameSpeed: settings.gameSpeed ?? defaultSettings.gameSpeed,
      laserCooldown: settings.laserCooldown ?? defaultSettings.laserCooldown,
      powerUpSpawnRate: settings.powerUpSpawnRate ?? defaultSettings.powerUpSpawnRate,
      powerUpProbabilities: settings.powerUpProbabilities ?? defaultSettings.powerUpProbabilities,
    };

    return { ...mergedSettings, ...customSettings };
  }
}
