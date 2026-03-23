export class Renderer {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  score: number = 0;
  lives: number = 3;
  level: number = 1;
  totalLevels: number = 5;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  clear() {
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawHUD() {
    // Draw level info (center)
    this.ctx.fillStyle = '#00ccff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Level: ${this.level} / ${this.totalLevels}`, this.width / 2, 30);

    // Draw score zone (left)
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.score}`, 20, 30);

    // Draw lives zone (right)
    this.ctx.fillStyle = '#ff4444';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Lives: ${this.lives}`, this.width - 20, 30);
  }

  setScore(score: number) {
    this.score = score;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${score}`, 20, 30);
  }

  setLives(lives: number) {
    this.lives = lives;
    this.ctx.fillStyle = '#ff4444';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Lives: ${lives}`, this.width - 20, 30);
  }

  setLevel(level: number, totalLevels: number) {
    this.level = level;
    this.totalLevels = totalLevels;
    this.drawHUD();
  }

  setTotalLevels(totalLevels: number) {
    this.totalLevels = totalLevels;
    this.drawHUD();
  }

  drawPaused() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', this.width / 2, this.height / 2 - 20);

    this.ctx.font = '24px Arial';
    this.ctx.fillText('Press ESC to resume', this.width / 2, this.height / 2 + 30);
  }

  drawGameOver() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = '#ff4444';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 20);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText('Press ENTER or CLICK to restart', this.width / 2, this.height / 2 + 30);
  }

  drawLevelComplete() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = '#00ccff';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('LEVEL COMPLETE!', this.width / 2, this.height / 2 - 40);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '28px Arial';
    this.ctx.fillText(`Score: ${this.score}`, this.width / 2, this.height / 2 + 10);

    this.ctx.font = '24px Arial';
    this.ctx.fillText('Press ENTER or CLICK to continue', this.width / 2, this.height / 2 + 50);
  }

  drawWin() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('YOU WIN!', this.width / 2, this.height / 2 - 20);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '28px Arial';
    this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 10);

    this.ctx.font = '24px Arial';
    this.ctx.fillText('Press ENTER or CLICK to play again', this.width / 2, this.height / 2 + 50);
  }

  drawMenu() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const centerX = this.width / 2;
    const startY = this.height / 2 - 180;

    this.ctx.textAlign = 'center';

    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 64px Arial';
    this.ctx.shadowColor = '#00ff88';
    this.ctx.shadowBlur = 20;
    this.ctx.fillText('🎮 ARKANOID', centerX, startY);
    this.ctx.shadowBlur = 0;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText('Kubernetes Brick Breaker', centerX, startY + 50);

    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#cccccc';
    this.ctx.fillText('Destroy red bricks to terminate pods!', centerX, startY + 90);

    this.ctx.fillStyle = '#00ccff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillText('CONTROLS', centerX, startY + 140);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('← → / Arrow Keys : Move paddle', centerX, startY + 180);
    this.ctx.fillText('Mouse              : Move paddle', centerX, startY + 205);
    this.ctx.fillText('Space / Click      : Launch ball', centerX, startY + 230);
    this.ctx.fillText('+ / -              : Adjust game speed', centerX, startY + 255);
    this.ctx.fillText('ESC                : Pause game', centerX, startY + 280);

    this.ctx.fillStyle = '#ff00ff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillText('POWER-UPS', centerX, startY + 330);

    this.ctx.fillStyle = '#00ccff';
    this.ctx.font = '15px monospace';
    this.ctx.fillText('W - Wide Paddle   M - Multi Ball', centerX, startY + 370);
    this.ctx.fillStyle = '#ff4400';
    this.ctx.fillText('L - Laser         S - Slow Ball', centerX, startY + 390);
    this.ctx.fillStyle = '#00ff00';
    this.ctx.fillText('💚 - Extra Life', centerX, startY + 410);

    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 28px Arial';
    this.ctx.shadowColor = '#00ff88';
    this.ctx.shadowBlur = 15;
    this.ctx.fillText('Press ENTER or CLICK to Start', centerX, startY + 470);
    this.ctx.shadowBlur = 0;
  }
}
