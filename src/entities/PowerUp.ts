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
  private pulsePhase: number = 0;
  private pulseSpeed: number = 0.1;
  private rotation: number = 0;

  constructor(x: number, y: number, type: PowerUpType, isDebug: boolean = false) {
    this.x = x;
    this.y = y;
    this.width = 45;
    this.height = 25;
    this.type = type;
    this.dy = 3;
    this.active = true;
    this.isDebug = isDebug;
    
    switch (type) {
      case 'wide':
        this.color = '#00ff00';
        this.label = '↔️';
        break;
      case 'multi':
        this.color = '#ffff00';
        this.label = '🔴';
        break;
      case 'laser':
        this.color = '#ffffff';
        this.label = '👾';
        break;
      case 'slow':
        this.color = '#0000ff';
        this.label = '🐌';
        break;
      case 'life':
        this.color = '#ff69b4';
        this.label = '❤️';
        break;
    }
  }

  update(gameSpeed: number = 1.0) {
    this.y += this.dy * gameSpeed;
    this.pulsePhase += this.pulseSpeed;
    this.rotation += 3;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;

    const pulse = 1 + Math.sin(this.pulsePhase) * 0.08;
    const effectiveWidth = this.width * pulse;
    const effectiveHeight = this.height * pulse;
    const offsetX = (this.width - effectiveWidth) / 2;
    const offsetY = (this.height - effectiveHeight) / 2;

    ctx.save();
    ctx.translate(this.x + this.width / 2 + Math.sin(this.rotation * Math.PI / 180) * 2, 
                  this.y + this.height / 2 + Math.cos(this.rotation * Math.PI / 180) * 2);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));

    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.roundRect(this.x + offsetX, this.y + offsetY, effectiveWidth, effectiveHeight, 4);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.label, this.x + this.width / 2, this.y + 17);

    ctx.restore();
  }
}
