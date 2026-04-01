

export class Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  dx: number = 0;
  private shakeTimer: number = 0;
  private hueOffset: number = 0;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = 8;
  }

  triggerEffect(): void {
    this.shakeTimer = 60;
    this.hueOffset = 0;
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

    if (this.shakeTimer > 0) {
      this.shakeTimer--;
      this.hueOffset = (this.hueOffset + 10) % 360;
    }
  }

  moveTo(x: number, canvas: HTMLCanvasElement) {
    this.x = x - this.width / 2;
    this.update(canvas.width);
  }

  draw(ctx: CanvasRenderingContext2D) {
    let baseColor = '#00ff88';
    let innerGlowColor = '#00ff88';
    let outerGlowColor = '#00ff88';
    let shakeX = 0;

    if (this.shakeTimer > 0) {
      const hue = Math.floor(this.hueOffset);
      baseColor = `hsl(${hue}, 100%, 50%)`;
      innerGlowColor = baseColor;
      outerGlowColor = baseColor;
      shakeX = (Math.random() - 0.5) * 4;
    }

    // Outer glow
    ctx.fillStyle = baseColor;
    ctx.shadowColor = outerGlowColor;
    ctx.shadowBlur = 25;
    
    ctx.beginPath();
    ctx.roundRect(this.x + shakeX, this.y, this.width, this.height, 8);
    ctx.fill();
    
    // Inner glow
    ctx.shadowBlur = 10;
    ctx.fillStyle = innerGlowColor;
    ctx.beginPath();
    ctx.roundRect(this.x + shakeX + 2, this.y + 2, this.width - 4, this.height - 4, 6);
    ctx.fill();
    
    // Center highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.roundRect(this.x + shakeX + 3, this.y + 3, this.width - 6, this.height / 2 - 2, 4);
    ctx.fill();
    
    ctx.shadowBlur = 0;
  }
}
