export class Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  active: boolean;
  maxHealth: number;
  health: number;

  constructor(x: number, y: number, width: number, height: number, color: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.active = true;
    this.maxHealth = this.isRedBrick(color) ? 2 : 1;
    this.health = this.maxHealth;
  }

  private isRedBrick(color: string): boolean {
    const redColors = ['#ff0044', '#ff3300', '#ff0000', '#ff4400'];
    return redColors.includes(color);
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 5;
    
    ctx.beginPath();
    ctx.roundRect(this.x + 1, this.y + 1, this.width - 2, this.height - 2, 4);
    ctx.fill();
    
    if (this.health < this.maxHealth && this.health > 0) {
      this.drawCrack(ctx);
    }
    
    ctx.shadowBlur = 0;
  }

  private drawCrack(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX - this.width * 0.3, centerY - this.height * 0.3);
    ctx.lineTo(centerX - this.width * 0.1, centerY - this.height * 0.1);
    ctx.lineTo(centerX + this.width * 0.2, centerY + this.height * 0.2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX + this.width * 0.1, centerY - this.height * 0.1);
    ctx.lineTo(centerX + this.width * 0.25, centerY - this.height * 0.25);
    ctx.stroke();
    
    ctx.restore();
  }
}
