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
  grid?: (string | null)[][];
};

const ALGORITHMIC_LEVELS: LevelConfig[] = [
  {
    rows: 5,
    cols: 8,
    offsetTop: 60,
    offsetLeft: 30,
    padding: 10,
    brickHeight: 25,
    colors: ['#ff0044', '#ff6600', '#ffcc00', '#00cc66', '#0066ff'],
    ballSpeed: 5,
    powerUpSpawnRate: 5,
  },
  {
    rows: 6,
    cols: 10,
    offsetTop: 50,
    offsetLeft: 20,
    padding: 8,
    brickHeight: 22,
    colors: ['#ff0044', '#ff6600', '#ffcc00', '#00cc66', '#0066ff', '#cc00ff'],
    ballSpeed: 5.5,
    powerUpSpawnRate: 4,
  },
  {
    rows: 7,
    cols: 10,
    offsetTop: 45,
    offsetLeft: 15,
    padding: 7,
    brickHeight: 20,
    colors: ['#ff3300', '#ff9900', '#ffff00', '#33ff66', '#3399ff', '#cc33ff'],
    ballSpeed: 6,
    powerUpSpawnRate: 3,
  },
  {
    rows: 8,
    cols: 12,
    offsetTop: 40,
    offsetLeft: 10,
    padding: 6,
    brickHeight: 18,
    colors: ['#ff0000', '#ff6600', '#ffcc00', '#ffff00', '#00ff66', '#00ccff', '#6666ff', '#cc00ff'],
    ballSpeed: 6.5,
    powerUpSpawnRate: 3,
  },
  {
    rows: 9,
    cols: 12,
    offsetTop: 35,
    offsetLeft: 5,
    padding: 5,
    brickHeight: 16,
    colors: ['#ff0000', '#ff4400', '#ff8800', '#ffcc00', '#ffff00', '#00ff44', '#00ccff', '#6666ff', '#cc00ff'],
    ballSpeed: 7,
    powerUpSpawnRate: 2,
  },
];

export class LevelManager {
  private levelIndex: number;
  private algorithmicConfigs: LevelConfig[];
  public customConfig: LevelConfig | null = null;
  private customLevelName: string = '';

  constructor(initialLevel: number = 0, customConfig?: LevelConfig) {
    this.levelIndex = initialLevel;
    this.algorithmicConfigs = ALGORITHMIC_LEVELS;
    if (customConfig) {
      this.setCustomConfig(customConfig);
    }
  }

  setCustomConfig(config: LevelConfig): void {
    this.customConfig = config;
    this.customLevelName = config.grid ? 'Custom Level' : `Level ${this.levelIndex + 1}`;
    this.levelIndex = 0;
  }

  getCurrentConfig(): LevelConfig {
    if (this.customConfig) {
      return this.customConfig;
    }
    return this.algorithmicConfigs[this.levelIndex % this.algorithmicConfigs.length];
  }

  nextLevel(): boolean {
    if (this.customConfig) {
      return false;
    }
    this.levelIndex++;
    return this.levelIndex < this.algorithmicConfigs.length;
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
    return this.algorithmicConfigs.length;
  }

  getCustomLevelName(): string {
    return this.customLevelName;
  }

  reset(): void {
    this.levelIndex = 0;
    this.customConfig = null;
    this.customLevelName = '';
  }

  isLastLevel(): boolean {
    if (this.customConfig) {
      return true;
    }
    return this.levelIndex >= this.algorithmicConfigs.length - 1;
  }

  canContinue(): boolean {
    if (this.customConfig) {
      return false;
    }
    return this.levelIndex < this.algorithmicConfigs.length;
  }

  isCustomLevel(): boolean {
    return this.customConfig !== null;
  }
}
