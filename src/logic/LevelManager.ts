export type LevelConfig = {
  rows: number;
  cols: number;
  offsetTop: number;
  offsetLeft: number;
  padding: number;
  brickHeight: number;
  colors: string[];
  ballSpeed: number;
  powerUpSpawnRate: number;
  powerUpProbabilities?: {
    wide: number;
    multi: number;
    laser: number;
    slow: number;
    life: number;
  };
  gameSpeed?: number;
  laserCooldown?: number;
  grid?: (string | null)[][];
};

export class LevelManager {
  private levelIndex: number;
  private fileBasedConfigs: LevelConfig[] = [];
  public customConfig: LevelConfig | null = null;
  private customLevelName: string = '';
  private levelLoader: import('../utils/LevelLoader').LevelLoader | null = null;
  private fileLevelsLoaded: boolean = false;

  constructor(initialLevel: number = 0, customConfig?: LevelConfig) {
    this.levelIndex = initialLevel;
    this.levelLoader = null;
    this.fileLevelsLoaded = false;
    
    if (customConfig) {
      this.setCustomConfig(customConfig);
    } else {
      this.loadFileBasedLevels();
    }
  }

  private async loadFileBasedLevels(): Promise<void> {
    if (this.fileLevelsLoaded) return;
    
    try {
      const LevelLoaderModule = await import('../utils/LevelLoader');
      this.levelLoader = new LevelLoaderModule.LevelLoader();
      const levels = await this.levelLoader.listAvailableLevels();
      
      for (const level of levels) {
        const parsed = await this.levelLoader.loadLevelById(level.id);
        if (parsed) {
          const config = this.levelLoader.parseLevelToConfig(parsed);
          this.fileBasedConfigs.push(config);
        }
      }
      
      this.fileLevelsLoaded = true;
    } catch (error) {
      console.error('Could not load file-based levels:', error);
      this.fileBasedConfigs = [];
      this.fileLevelsLoaded = true;
    }
  }

  setCustomConfig(config: LevelConfig): void {
    this.customConfig = config;
    this.customLevelName = config.grid ? 'Custom Level' : `Level ${this.levelIndex + 1}`;
    this.levelIndex = 0;
  }

  getCurrentConfig(): LevelConfig | null {
    if (this.customConfig) {
      return this.customConfig;
    }
    if (!this.fileLevelsLoaded || this.fileBasedConfigs.length === 0) {
      return null;
    }
    return this.fileBasedConfigs[this.levelIndex];
  }

  async nextLevel(): Promise<boolean> {
    if (this.customConfig) {
      return false;
    }
    this.levelIndex++;
    return this.levelIndex < this.fileBasedConfigs.length;
  }

  getCurrentLevel(): number {
    if (this.customConfig) {
      return 1;
    }
    return this.levelIndex + 1;
  }

  getTotalLevels(): number {
    if (this.customConfig) {
      return 1;
    }
    return this.fileBasedConfigs.length;
  }

  getCustomLevelName(): string {
    return this.customLevelName;
  }

  reset(): void {
    this.levelIndex = 0;
    this.customConfig = null;
    this.customLevelName = '';
    this.fileLevelsLoaded = false;
  }

  isLastLevel(): boolean {
    if (this.customConfig) {
      return true;
    }
    return this.levelIndex >= this.fileBasedConfigs.length - 1;
  }

  canContinue(): boolean {
    if (this.customConfig) {
      return false;
    }
    return this.levelIndex < this.fileBasedConfigs.length;
  }

  isCustomLevel(): boolean {
    return this.customConfig !== null;
  }
}
