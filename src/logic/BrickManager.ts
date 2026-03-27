import { Brick } from '../entities/Brick';
import type { LevelConfig } from './LevelManager';

export class BrickManager {
  brickList: Brick[];
  private config: LevelConfig;
  private isMobile: boolean;

  constructor(canvasWidth: number = 800, config?: LevelConfig, isMobile: boolean = false) {
    this.brickList = [];
    this.config = config || this.getDefaultConfig();
    this.isMobile = isMobile;
    
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
    const brickPadding = this.isMobile ? 2 : this.config.padding;
    const brickHeight = this.isMobile ? this.config.brickHeight * 0.8 : this.config.brickHeight;
    const brickWidth = availableWidth / this.config.cols - brickPadding;
    
    const grid = this.config.grid;
    
    if (grid && grid.length > 0) {
      // Use grid layout to place bricks with specific colors
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          const color = grid[r][c];
          if (color !== null) {
            const brickX = this.config.offsetLeft + c * (brickWidth + brickPadding);
            const brickY = this.config.offsetTop + r * (brickHeight + brickPadding);
            this.brickList.push(new Brick(brickX, brickY, brickWidth, brickHeight, color));
          }
        }
      }
    } else {
      // Fallback to color cycling for old configs without grid
      const colors = this.config.colors;
      for (let c = 0; c < this.config.cols; c++) {
        for (let r = 0; r < this.config.rows; r++) {
          const brickX = this.config.offsetLeft + c * (brickWidth + brickPadding);
          const brickY = this.config.offsetTop + r * (brickHeight + brickPadding);
          const color = colors[r % colors.length];
          
          this.brickList.push(new Brick(brickX, brickY, brickWidth, brickHeight, color));
        }
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
