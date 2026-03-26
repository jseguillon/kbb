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

  async drawMenu(game: any) {
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

    const urlParams = new URLSearchParams(window.location.search);
    const simulate = urlParams.get("simulate") === "true";
    
    let status: any = null;
    if (simulate) {
      status = {
        middleware: 'simulated',
        k8s: 'simulated',
        message: 'Simulated mode',
        runningPods: 0
      };
    } else {
      status = await game.checkStatus();
    }
    this.drawStatusIndicator(centerX, startY + 90, status);

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

    this.ctx.fillStyle = '#00ccff';
    this.ctx.font = '15px monospace';
    this.ctx.fillText('↔️ - Wide Paddle   🔴 - Multi Ball', centerX, powerUpsY + 20);
    this.ctx.fillStyle = '#ff4400';
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
}
