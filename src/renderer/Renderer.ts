export class Renderer {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  score: number = 0;
  lives: number = 3;
  level: number = 1;
  totalLevels: number = 5;
  private status: any = null;
  private stars: Array<{x: number, y: number, size: number, speed: number, opacity: number}> = [];
  private fps: number = 0;
  private showFps: boolean = false;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.stars = this.generateStars(20);
  }

  setFps(fps: number): void {
    this.fps = fps;
  }

  toggleFpsDisplay(): void {
    this.showFps = !this.showFps;
  }

  drawFpsDisplay(): void {
    if (!this.showFps) return;
    
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = 'bold 14px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);
  }

  setStatus(status: any) {
    this.status = status;
  }

  getStatus(): any {
    return this.status;
  }

  setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.stars = this.generateStars(20);
  }

  private generateStars(count: number): Array<{x: number, y: number, size: number, speed: number, opacity: number}> {
    const stars: Array<{x: number, y: number, size: number, speed: number, opacity: number}> = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 0.5 + Math.random() * 1.5,
        speed: 0.2 + Math.random() * 0.5,
        opacity: 0.3 + Math.random() * 0.7
      });
    }
    return stars;
  }

  private drawStars(): void {
    this.ctx.fillStyle = '#ffffff';
    for (const star of this.stars) {
      this.ctx.globalAlpha = star.opacity;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;
  }

  private updateStars(): void {
    this.stars.forEach(star => {
      star.y += star.speed;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    });
  }

  clear() {
    // Radial gradient background
    const gradient = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, Math.max(this.width, this.height)
    );
    gradient.addColorStop(0, '#2a2a4e');
    gradient.addColorStop(1, '#1a1a2e');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw stars
    this.updateStars();
    this.drawStars();
    
    // Subtle grid overlay
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.01)';
    this.ctx.lineWidth = 1;
    const gridSize = 40;
    
    for (let x = 0; x <= this.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    
    for (let y = 0; y <= this.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
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
    
    const heartsPerRow = 4;
    const lineHeight = 24;
    const baseY = 30;
    
    for (let row = 0; row < Math.ceil(this.lives / heartsPerRow); row++) {
      const startHeart = row * heartsPerRow;
      const remainingHearts = Math.min(heartsPerRow, this.lives - startHeart);
      const heartsRow = '❤️'.repeat(remainingHearts);
      const y = baseY + row * lineHeight;
      this.ctx.fillText(heartsRow, this.width - 20, y);
    }
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
    
    const heartsPerRow = 4;
    const lineHeight = 24;
    const baseY = 30;
    
    for (let row = 0; row < Math.ceil(lives / heartsPerRow); row++) {
      const startHeart = row * heartsPerRow;
      const remainingHearts = Math.min(heartsPerRow, lives - startHeart);
      const heartsRow = '❤️'.repeat(remainingHearts);
      const y = baseY + row * lineHeight;
      this.ctx.fillText(heartsRow, this.width - 20, y);
    }
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
    this.ctx.fillText('Press SPACE or CLICK to restart', this.width / 2, this.height / 2 + 30);
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
    this.ctx.fillText('Press SPACE or CLICK to continue', this.width / 2, this.height / 2 + 50);
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
    this.ctx.fillText('Press SPACE or CLICK to play again', this.width / 2, this.height / 2 + 50);
  }

  drawMenu(game: any) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const centerX = this.width / 2;
    const startY = this.height / 2 - 180;

    this.ctx.textAlign = 'center';

    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 64px Arial';
    this.ctx.shadowColor = '#00ff88';
    this.ctx.shadowBlur = 20;
    this.ctx.fillText('🎮 KBB', centerX, startY);
    this.ctx.shadowBlur = 0;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText('Kubernetes Brick Breaker', centerX, startY + 50);

    this.drawStatusIndicator(centerX, startY + 90, this.status);

    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#cccccc';
    this.ctx.fillText('Destroy red bricks to terminate pods on your cluster!', centerX, startY + 125);

    this.ctx.fillStyle = '#00ccff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillText('CONTROLS', centerX, startY + 160);

    const isMobile = game.isMobile;
    let controlsEndY = 0;
    if (isMobile) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '15px monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('Swipe left/right  : Move paddle', centerX - 150, startY + 180);
      this.ctx.fillText('Tap               : Launch ball', centerX - 150, startY + 202);
      controlsEndY = startY + 202;
    } else {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '15px monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('← → / Arrow Keys  : Move paddle', centerX - 150, startY + 180);
      this.ctx.fillText('Mouse             : Move paddle', centerX - 150, startY + 202);
      this.ctx.fillText('Space / Click     : Launch ball', centerX - 150, startY + 224);
      this.ctx.fillText('+ / -             : Adjust game speed', centerX - 150, startY + 246);
      this.ctx.fillText('ESC               : Pause game', centerX - 150, startY + 268);
      controlsEndY = startY + 268;
    }
    this.ctx.textAlign = 'center';

    const powerUpsY = isMobile ? controlsEndY + 60 : controlsEndY + 82;
    
    this.ctx.fillStyle = '#ff00ff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillText('POWER-UPS', centerX, powerUpsY);

    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '15px monospace';
    this.ctx.fillText('↔️ - Wide Paddle   🔴 - Multi Ball', centerX, powerUpsY + 20);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('👾 - Laser         🐌 - Slow Ball', centerX, powerUpsY + 40);
    this.ctx.fillStyle = '#ff69b4';
    this.ctx.fillText('❤️ - Extra Life', centerX, powerUpsY + 60);

    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 28px Arial';
    this.ctx.shadowColor = '#00ff88';
    this.ctx.shadowBlur = 15;
    this.ctx.fillText(isMobile ? 'Tap to Start' : 'Press SPACE or CLICK to Start', centerX, powerUpsY + 100);
    this.ctx.shadowBlur = 0;
  }

  drawStatusIndicator(centerX: number, y: number, status: any) {
    if (!status) {
      this.ctx.fillStyle = '#ff4444';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.fillText('⚠️  Checking connection...', centerX, y);
      return;
    }

    let icon = '';
    let color = '';
    let message = '';

    if (status.middleware === 'simulated') {
      icon = '🎮';
      color = '#00ff88';
      message = 'Simulated mode';
    } else if (status.middleware === 'error') {
      icon = '❌';
      color = '#ff4444';
      message = status.message || 'Middleware not reachable';
    } else if (status.k8s === 'error') {
      icon = '⚠️';
      color = '#ffaa00';
      message = status.message || 'Kubernetes connection failed';
    } else {
      icon = '✅';
      color = '#00ff88';
      message = `${status.message} (${status.runningPods} pods)`;
    }

    this.ctx.fillStyle = color;
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText(`${icon}  ${message}`, centerX, y);
  }

  drawMenuPlaceholder() {
    const centerX = this.width / 2;
    const y = this.height / 2 - 80;

    this.ctx.fillStyle = '#ff4444';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText('❌  Middleware not reachable', centerX, y);
  }
  
  drawCustomWin() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    this.ctx.textAlign = 'center';

    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 64px Arial';
    this.ctx.shadowColor = '#00ff88';
    this.ctx.shadowBlur = 20;
    this.ctx.fillText('🎉 Custom Level Complete!', centerX, centerY - 50);
    this.ctx.shadowBlur = 0;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Final Score: ${this.score}`, centerX, centerY + 20);

    this.ctx.fillStyle = '#00ccff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillText('Press SPACE or CLICK to play again', centerX, centerY + 80);
  }
}
