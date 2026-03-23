export type PowerUpType = 'wide' | 'multi' | 'laser' | 'slow' | 'life';

export class PowerUp {
  x: number;
  y: number;
  width: number;
  height: number;
  type: PowerUpType;
  dy: number;
  active: boolean;
  color: string;
  label: string;
  isDebug: boolean;

  constructor(x: number, y: number, type: PowerUpType, isDebug: boolean = false) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 15;
    this.type = type;
    this.dy = 3;
    this.active = true;
    this.isDebug = isDebug;
    
    switch (type) {
      case 'wide':
        this.color = '#00ccff';
        this.label = 'W';
        break;
      case 'multi':
        this.color = '#ff00ff';
        this.label = 'M';
        break;
      case 'laser':
        this.color = '#ff4400';
        this.label = 'L';
        break;
      case 'slow':
        this.color = '#00ff88';
        this.label = 'S';
        break;
      case 'life':
        this.color = '#00ff00';
        this.label = 'L';
        break;
    }
  }

  update(gameSpeed: number = 1.0) {
    this.y += this.dy * gameSpeed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;

    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 4);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.label, this.x + this.width / 2, this.y + 11);
  }
}
