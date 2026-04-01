import type { LevelConfig } from '../logic/LevelManager';

// Import all levels as modules to be bundled in the build
import level1 from '../levels/level1.json';
import level2 from '../levels/level2.json';
import level3 from '../levels/level3.json';
import level4 from '../levels/level4.json';
import level5 from '../levels/level5.json';
import level6 from '../levels/level6.json';
import level7 from '../levels/level7.json';
import level8 from '../levels/level8.json';
import level9 from '../levels/level9.json';

const levelsData: Record<string, any> = {
  1: level1,
  2: level2,
  3: level3,
  4: level4,
  5: level5,
  6: level6,
  7: level7,
  8: level8,
  9: level9,
};

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
  async loadLevelFromFile(filePath: string): Promise<ParsedLevel | null> {
    // For file uploads, still use fetch
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load level: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Invalid content type: ${contentType}`);
      }
      
      const data = await response.json();
      return this.processLevelData(data, filePath);
    } catch (error) {
      console.error(`Error loading level from ${filePath}:`, error);
      return null;
    }
  }

  async loadLevelById(levelId: number): Promise<ParsedLevel | null> {
    const id = levelId.toString();
    const data = levelsData[id];
    
    if (!data) {
      console.error(`Level ${levelId} not found`);
      return null;
    }
    
    return this.processLevelData(data, `level${id}.json`);
  }

  async listAvailableLevels(): Promise<Array<{ id: number; name: string }>> {
    const levels = [];
    
    for (const [id, data] of Object.entries(levelsData)) {
      const name = this.extractNameFromData(data);
      levels.push({ id: parseInt(id), name });
    }
    
    return levels;
  }

  private processLevelData(data: any, source: string): ParsedLevel | null {
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
      console.error('Invalid grid format in level file');
      return null;
    }
    
    const colors = this.extractColors(grid);
    const name = settings?.gameSpeed !== undefined 
      ? this.extractNameFromData(data)
      : this.extractNameFromPath(source);
    
    console.log(`Level loaded successfully: ${source}`, { name, rows: grid.length, cols: grid[0]?.length, colors });
    
    return { name, grid, colors, settings };
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

  private extractNameFromData(data: any): string {
    if (data.metadata?.name) {
      return data.metadata.name;
    }
    return 'Level';
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
