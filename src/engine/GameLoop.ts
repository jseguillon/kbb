export class GameLoop {
  private updateCallback: () => void;
  private drawCallback: () => void;
  private animationFrameId: number | null = null;

  constructor(updateCallback: () => void, drawCallback: () => void) {
    this.updateCallback = updateCallback;
    this.drawCallback = drawCallback;
  }

  start() {
    if (this.animationFrameId !== null) return;
    this.animationFrameId = requestAnimationFrame(this.tick.bind(this));
  }

  stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private tick(_currentTime: number) {
    this.updateCallback();
    this.drawCallback();

    this.animationFrameId = requestAnimationFrame(this.tick.bind(this));
  }
}
