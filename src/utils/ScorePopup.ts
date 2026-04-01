export class ScorePopup {
  x: number;
  y: number;
  value: number;
  life: number;
  maxLife: number;
  vy: number;
  color: string;

  constructor(x: number, y: number, value: number, color: string) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.color = color;
    this.maxLife = 40;
    this.life = this.maxLife;
    this.vy = -2;
  }

  update(): void {
    this.y += this.vy;
    this.vy += 0.1;
    this.life--;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const opacity = this.life / this.maxLife;
    const bounce = Math.sin((this.maxLife - this.life) * 0.3) * 3;
    
    ctx.save();
    ctx.translate(0, bounce);
    ctx.globalAlpha = opacity;
    
    ctx.fillStyle = this.color;
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    
    ctx.fillText(`+${this.value}`, this.x, this.y);
    
    ctx.restore();
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
  }

  isExpired(): boolean {
    return this.life <= 0;
  }
}

export class ScorePopupManager {
  private popups: ScorePopup[] = [];
  private maxPopups: number = 10;

  spawn(x: number, y: number, value: number, color: string): void {
    if (this.popups.length < this.maxPopups) {
      this.popups.push(new ScorePopup(x, y, value, color));
    }
  }

  update(): void {
    this.popups = this.popups.filter(p => {
      p.update();
      return !p.isExpired();
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.popups.forEach(p => p.draw(ctx));
  }

  clear(): void {
    this.popups = [];
  }
}
