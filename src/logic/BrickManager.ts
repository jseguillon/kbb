import { Brick } from '../entities/Brick';
import type { LevelConfig } from './LevelManager';

export class BrickManager {
  brickList: Brick[];
  private config: LevelConfig;

  constructor(canvasWidth: number = 800, config?: LevelConfig) {
    this.brickList = [];
    this.config = config || this.getDefaultConfig();
    
    this.createBricks(canvasWidth);
  }

  private getDefaultConfig(): LevelConfig {
    return {
      rows: 5,
      cols: 8,
      offsetTop: 60,
      offsetLeft: 30,
      padding: 10,
      brickHeight: 25,
      colors: ['#ff0044', '#ff6600', '#ffcc00', '#00cc66', '#0066ff'],
      ballSpeed: 5,
      powerUpSpawnRate: 5,
    };
  }

  createBricks(width: number) {
    const availableWidth = width - 2 * this.config.offsetLeft;
    const brickWidth = availableWidth / this.config.cols - this.config.padding;
    const brickHeight = this.config.brickHeight;
    
    const colors = this.config.colors;

    for (let c = 0; c < this.config.cols; c++) {
      for (let r = 0; r < this.config.rows; r++) {
        const brickX = this.config.offsetLeft + c * (brickWidth + this.config.padding);
        const brickY = this.config.offsetTop + r * (brickHeight + this.config.padding);
        const color = colors[r % colors.length];
        
        this.brickList.push(new Brick(brickX, brickY, brickWidth, brickHeight, color));
      }
    }
  }

  updateConfig(config: LevelConfig): void {
    this.config = config;
    this.brickList = [];
    this.createBricks(0);
  }

  removeBrick(brick: Brick) {
    const index = this.brickList.indexOf(brick);
    if (index > -1) {
      this.brickList.splice(index, 1);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.brickList.forEach(brick => brick.draw(ctx));
  }
}
