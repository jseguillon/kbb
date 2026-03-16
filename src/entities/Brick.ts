export class Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  active: boolean;

  constructor(x: number, y: number, width: number, height: number, color: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.active = true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 5;
    
    ctx.beginPath();
    ctx.roundRect(this.x + 1, this.y + 1, this.width - 2, this.height - 2, 4);
    ctx.fill();
    
    ctx.shadowBlur = 0;
  }
}
