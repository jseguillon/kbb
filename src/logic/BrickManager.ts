import { Brick } from '../entities/Brick';

export class BrickManager {
  brickList: Brick[];
  rows: number;
  cols: number;
  padding: number;
  offsetTop: number;
  offsetLeft: number;

  constructor(canvasWidth: number = 800) {
    this.brickList = [];
    this.rows = 5;
    this.cols = 8;
    this.padding = 10;
    this.offsetTop = 60;
    this.offsetLeft = 30;
    
    this.createBricks(canvasWidth);
  }

  createBricks(width: number) {
    const availableWidth = width - 2 * this.offsetLeft;
    const brickWidth = availableWidth / this.cols - this.padding;
    const brickHeight = 25;
    
    const colors = [
      '#ff0044',
      '#ff6600',
      '#ffcc00',
      '#00cc66',
      '#0066ff',
    ];

    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const brickX = this.offsetLeft + c * (brickWidth + this.padding);
        const brickY = this.offsetTop + r * (brickHeight + this.padding);
        const color = colors[r % colors.length];
        
        this.brickList.push(new Brick(brickX, brickY, brickWidth, brickHeight, color));
      }
    }
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
