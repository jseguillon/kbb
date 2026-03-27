export class AssetLoader {
  private static instance: AssetLoader;
  private assets: Map<string, HTMLImageElement> = new Map();
  private loading: Map<string, Promise<HTMLImageElement>> = new Map();

  private constructor() {}

  static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
  }

  async loadSVG(path: string): Promise<HTMLImageElement> {
    if (this.assets.has(path)) {
      return this.assets.get(path)!;
    }

    if (this.loading.has(path)) {
      return this.loading.get(path)!.then(() => this.assets.get(path)!);
    }

    const loadPromise = this.fetchAndParseSVG(path);
    this.loading.set(path, loadPromise);

    try {
      const image = await loadPromise;
      this.assets.set(path, image);
      return image;
    } finally {
      this.loading.delete(path);
    }
  }

  private async fetchAndParseSVG(path: string): Promise<HTMLImageElement> {
    const response = await fetch(path);
    const svgText = await response.text();
    
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const img = new Image();
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };
    });
    
    img.src = url;
    
    return promise;
  }

  clearCache(): void {
    for (const img of this.assets.values()) {
      const url = (img as any).src;
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    }
    this.assets.clear();
    this.loading.clear();
  }
}
