export class InputHandler {
  private listeners: Map<string, Set<EventListener>> = new Map();

  addEventListener(event: string, listener: EventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    document.addEventListener(event, listener);
  }

  removeEventListener(event: string, listener: EventListener) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(listener);
      document.removeEventListener(event, listener);
    }
  }

  clear() {
    for (const [event, listeners] of this.listeners) {
      for (const listener of listeners) {
        document.removeEventListener(event, listener);
      }
    }
    this.listeners.clear();
  }
}
