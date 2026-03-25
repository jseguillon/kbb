export class GameLoop {
  private updateCallback: (deltaTime: number) => void;
  private drawCallback: () => Promise<void> | void;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  constructor(updateCallback: (deltaTime: number) => void, drawCallback: () => Promise<void> | void) {
    this.updateCallback = updateCallback;
    this.drawCallback = drawCallback;
  }

  start() {
    if (this.animationFrameId !== null) return;
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.tick.bind(this));
  }

  stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private async tick(currentTime: number) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.updateCallback(deltaTime);
    await this.drawCallback();

    this.animationFrameId = requestAnimationFrame(this.tick.bind(this));
  }
}
