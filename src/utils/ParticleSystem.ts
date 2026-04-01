export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;

  constructor(x: number, y: number, color: string, size: number) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.maxLife = 30 + Math.random() * 20;
    this.life = this.maxLife;
    
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }

  update(): void {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const opacity = this.life / this.maxLife;
    if (opacity <= 0) return;
    
    ctx.fillStyle = this.color;
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  isDead(): boolean {
    return this.life <= 0;
  }
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles: number = 50;
  private colors: string[] = [];

  spawn(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length < this.maxParticles) {
        const size = 2 + Math.random() * 3;
        this.colors.push(color);
        this.particles.push(new Particle(x, y, color, size));
      }
    }
  }

  update(): void {
    // Remove dead particles without creating new array
    let writeIndex = 0;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.update();
      if (!p.isDead()) {
        this.particles[writeIndex++] = p;
      }
    }
    this.particles.length = writeIndex;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.particles.length === 0) return;
    
    ctx.save();
    this.particles.forEach(p => p.draw(ctx));
    ctx.restore();
  }

  clear(): void {
    this.particles = [];
    this.colors = [];
  }
}
