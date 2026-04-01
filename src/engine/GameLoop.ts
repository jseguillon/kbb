export class GameLoop {
  private updateCallback: (deltaTime: number) => void;
  private drawCallback: () => void;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;
  private currentFps: number = 0;

  constructor(updateCallback: (deltaTime: number) => void, drawCallback: () => void) {
    this.updateCallback = updateCallback;
    this.drawCallback = drawCallback;
  }

  startWithFpsCallback(updateCallback: (deltaTime: number, fps: number) => void, drawCallback: () => void) {
    this.updateCallback = updateCallback as (deltaTime: number) => void;
    this.drawCallback = drawCallback;
    this.start();
  }

  start() {
    if (this.animationFrameId !== null) return;
    this.lastTime = performance.now();
    this.lastFpsUpdate = this.lastTime;
    this.animationFrameId = requestAnimationFrame(this.tick.bind(this));
  }

  stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  getFps(): number {
    return this.currentFps;
  }

  private tick(currentTime: number) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.frameCount++;

    // Calculate FPS every second
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.currentFps = Math.round(this.frameCount * 1000 / (currentTime - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
    }

    this.updateCallback(deltaTime);
    this.drawCallback();

    this.animationFrameId = requestAnimationFrame(this.tick.bind(this));
  }
}
