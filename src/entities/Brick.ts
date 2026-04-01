import { AssetLoader } from '../utils/AssetLoader';

export class Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  active: boolean;
  maxHealth: number;
  health: number;
  private crackImage: HTMLImageElement | null = null;
  private crackLoaded: boolean = false;

  constructor(x: number, y: number, width: number, height: number, color: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.active = true;
    this.maxHealth = this.isRedBrick(color) ? 2 : 1;
    this.health = this.maxHealth;
    
    if (this.isRedBrick(color)) {
      this.loadCrackImage();
    }
  }

  private isRedBrick(color: string): boolean {
    const redColors = ['#ff0044', '#ff3300', '#ff0000', '#ff4400'];
    return redColors.includes(color);
  }

  private async loadCrackImage(): Promise<void> {
    if (this.crackLoaded) return;
    
    try {
      const assetLoader = AssetLoader.getInstance();
      this.crackImage = await assetLoader.loadSVG('./src/assets/crack.svg');
      this.crackLoaded = true;
    } catch (error) {
      console.error('Failed to load crack SVG:', error);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 5;
    
    ctx.beginPath();
    ctx.roundRect(this.x + 1, this.y + 1, this.width - 2, this.height - 2, 4);
    ctx.fill();
    
    if (this.health < this.maxHealth && this.health > 0 && this.crackLoaded && this.crackImage) {
      this.drawCrack(ctx);
    }
    
    ctx.shadowBlur = 0;
  }

  private drawCrack(ctx: CanvasRenderingContext2D): void {
    if (!this.crackImage) return;
    
    const scale = Math.min(this.width, this.height) / 100;
    const drawnWidth = 100 * scale;
    const drawnHeight = 100 * scale;
    const offsetX = (this.width - drawnWidth) / 2;
    const offsetY = (this.height - drawnHeight) / 2;
    
    ctx.drawImage(
      this.crackImage,
      this.x + offsetX,
      this.y + offsetY,
      drawnWidth,
      drawnHeight
    );
  }
}
