

export class Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  dx: number = 0;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = 8;
  }

  update(gameWidth: number, gameSpeed: number = 1.0) {
    this.x += this.dx * this.speed * gameSpeed;
    
    const maxX = gameWidth - this.width;
    const minX = 0;
    
    if (this.x < minX) {
      this.x = minX;
    }
    if (this.x > maxX) {
      this.x = maxX;
    }
  }

  moveTo(x: number, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    this.x = x - rect.left - this.width / 2;
    this.update(canvas.width);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 15;
    
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 8);
    ctx.fill();
    
    ctx.shadowBlur = 0;
  }
}
