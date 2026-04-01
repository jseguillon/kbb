import { Paddle } from './Paddle';
import { Brick } from './Brick';
import type { Game as GameClass } from '../engine/Game';

export class Ball {
  x: number;
  y: number;
  radius: number;
  speed: number;
  dx: number;
  dy: number;
  launched: boolean;
  isMain: boolean;
  active: boolean;
  private trail: Array<{x: number, y: number, opacity: number}> = [];

  constructor(x: number, y: number, radius: number, isMain: boolean = true) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = 5;
    this.dx = 0;
    this.dy = 0;
    this.launched = false;
    this.isMain = isMain;
    this.active = true;
  }

  launch() {
    if (!this.launched) {
      this.launched = true;
      this.active = true;
      this.dy = -this.speed;
      this.dx = this.speed * 0.5 * (Math.random() > 0.5 ? 1 : -1);
    }
  }

  update(game: GameClass, canvasHeight: number) {
    this.updateWithSpeed(game, canvasHeight, 1.0);
  }

  updateWithSpeed(game: GameClass, canvasHeight: number, speedMultiplier: number) {
    if (!this.launched && game.paddle) {
      this.x = game.paddle.x + game.paddle.width / 2;
      this.y = game.paddle.y - this.radius - 2;
      return;
    }

    this.trail.push({x: this.x, y: this.y, opacity: 0.6});
    if (this.trail.length > 15) {
      this.trail.shift();
    }

    this.x += this.dx * speedMultiplier;
    this.y += this.dy * speedMultiplier;

    if (this.y - this.radius > canvasHeight) {
      this.active = false;
    }
  }

  bounceOffPaddle(paddle: Paddle) {
    const paddleCenter = paddle.x + paddle.width / 2;
    const hitPoint = this.x - paddleCenter;
    const normalizedHit = hitPoint / (paddle.width / 2);
    
    const angle = normalizedHit * (Math.PI / 4);
    
    this.dx = this.speed * Math.sin(angle);
    this.dy = -this.speed * Math.cos(angle);
    
    this.dy = -Math.abs(this.dy);
  }

  bounceOffWall(_canvasHeight: number) {
    if (this.y - this.radius < 0) {
      this.dy = -this.dy;
    } else if (this.x - this.radius < 0 || this.x + this.radius > _canvasHeight * 0.75) {
      this.dx = -this.dx;
    }
  }

  bounceOffBrick(brick: Brick) {
    const prevCenterX = this.x - this.dx;
    const prevCenterY = this.y - this.dy;
    
    const wasAbove = prevCenterY + this.radius <= brick.y;
    const wasBelow = prevCenterY - this.radius >= brick.y + brick.height;
    const wasLeft = prevCenterX + this.radius <= brick.x;
    const wasRight = prevCenterX - this.radius >= brick.x + brick.width;
    
    if (wasAbove || wasBelow) {
      this.dy = -this.dy;
    } else if (wasLeft || wasRight) {
      this.dx = -this.dx;
    } else {
      this.dy = -this.dy;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Draw trail more efficiently
    if (this.trail.length > 1) {
      for (let i = 0; i < this.trail.length; i++) {
        const point = this.trail[i];
        const opacity = point.opacity * (i / this.trail.length);
        const size = this.radius * (0.5 + 0.5 * (i / this.trail.length));
        
        ctx.globalAlpha = Math.max(0.1, opacity);
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    }
    
    // Draw main ball
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4444';
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.closePath();
    
    ctx.shadowBlur = 0;
  }
}
