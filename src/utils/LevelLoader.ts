import type { LevelConfig } from '../logic/LevelManager';

// Dynamically import all level JSON files from the levels directory
const levelModules = import.meta.glob('../levels/*.json', { eager: true });

const levelsData: Record<string, any> = {};

// Sort files alphabetically and assign sequential IDs
const sortedFiles = Object.keys(levelModules).sort();
sortedFiles.forEach((path, index) => {
  const id = (index + 1).toString();
  const data = (levelModules[path] as { default: any }).default;
  levelsData[id] = data;
});

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
