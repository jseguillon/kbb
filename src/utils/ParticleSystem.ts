export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  active: boolean = true;

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
    if (this.life <= 0) {
      this.active = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;
    
    const opacity = this.life / this.maxLife;
    ctx.globalAlpha = opacity;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles: number = 50;

  spawn(x: number, y: number, color: string, count: number): void {
    // Remove inactive particles first to make room
    const activeParticles = this.particles.filter(p => p.active);
    this.particles = activeParticles;
    
    const spaceAvailable = this.maxParticles - this.particles.length;
    const toSpawn = Math.min(count, spaceAvailable);
    
    for (let i = 0; i < toSpawn; i++) {
      const size = 2 + Math.random() * 3;
      this.particles.push(new Particle(x, y, color, size));
    }
  }

  update(): void {
    // Only update and draw active particles
    this.particles = this.particles.filter(p => {
      if (!p.active) return false;
      p.update();
      return p.active;
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(p => p.draw(ctx));
  }

  clear(): void {
    this.particles = [];
  }
}
