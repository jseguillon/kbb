import { LevelEditorManager } from '../logic/LevelEditorManager';
import { LevelLoader } from '../utils/LevelLoader';

export class LevelEditor {
  private container: HTMLDivElement;
  private editorManager: LevelEditorManager;
  private selectedColor: string = '#ff0044';
  private brickWidth: number = 30;
  private brickHeight: number = 30;
  private padding: number = 3;
  private isMobile: boolean = false;

  constructor() {
    this.isMobile = this.detectMobile();
    const defaultCols = 24;
    this.editorManager = new LevelEditorManager(16, defaultCols);
    
    if (this.isMobile) {
      this.brickWidth = 26;
      this.brickHeight = 25;
      this.padding = 1;
    }
    this.container = this.createContainer();
    this.setupEventListeners();
  }

  private createContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'level-editor-container';
    container.innerHTML = `
      <div class="editor-header">
        <h1>🎮 Level Editor</h1>
        <div class="editor-controls">
          <input type="text" class="level-name-input" placeholder="Level Name" value="Custom Level 1">
          <button class="btn-save" data-action="save">Save Level</button>
          <button class="btn-load" data-action="load">Load Level</button>
          <button class="btn-download" data-action="download">Download</button>
          <button class="btn-load-file" data-action="load-file">Load from File</button>
          <button class="btn-clear" data-action="clear">Clear</button>
          <button class="btn-play" data-action="play">▶️ Play Level</button>
          <button class="btn-back" data-action="back">← Back to Game</button>
        </div>
      </div>
      
      <input type="file" id="level-file-input" accept=".json" style="display: none;">
      
      <div class="editor-main">
        <div class="editor-sidebar">
          <div class="color-selector">
            <h3>Select Brick Color</h3>
            <div class="color-grid">
              <button class="color-btn" data-color="#ff0044" style="background: #ff0044;"></button>
              <button class="color-btn" data-color="#ff881a" style="background: #ff881a;"></button>
              <button class="color-btn" data-color="#ffc800" style="background: #ffc800;"></button>
              <button class="color-btn" data-color="#ffffff" style="background: #ffffff;"></button>
              <button class="color-btn" data-color="#ccff1a" style="background: #ccff1a;"></button>
              <button class="color-btn" data-color="#1aff1a" style="background: #1aff1a;"></button>
              <button class="color-btn" data-color="#000000" style="background: #000000;"></button>
              <button class="color-btn" data-color="#1affcc" style="background: #1affcc;"></button>
              <button class="color-btn" data-color="#1a66ff" style="background: #1a66ff;"></button>
              <button class="color-btn" data-color="#1a1aff" style="background: #1a1aff;"></button>
              <button class="color-btn" data-color="#661aff" style="background: #661aff;"></button>
              <button class="color-btn" data-color="#cc1aff" style="background: #cc1aff;"></button>
              <button class="color-btn" data-color="#7a7a7a" style="background: #7a7a7a"></button>
            </div>
          </div>
          
          <div class="save-load-section">
            <h3>Save / Load Levels</h3>
            <div class="saved-levels-list"></div>
          </div>
          
          <div class="editor-help">
            <h3>How to Use</h3>
            <ul>
              <li><strong>Left Click:</strong> Place brick</li>
              <li><strong>Right Click:</strong> Delete brick</li>
              <li>Select color first, then click on grid</li>
            </ul>
          </div>
        </div>
        
        <div class="editor-canvas-container">
          <canvas id="editorCanvas"></canvas>
        </div>
      </div>
      
      <div class="editor-footer">
        <span class="info-text">Grid: 24 columns × 16 rows | Click to edit bricks</span>
      </div>
    `;
    
    return container;
  }

  private setupEventListeners(): void {
    const canvas = this.container.querySelector('#editorCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    
    // Set canvas size
    const totalWidth = this.editorManager.getGridSize().cols * (this.brickWidth + this.padding);
    const totalHeight = this.editorManager.getGridSize().rows * (this.brickHeight + this.padding);
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    
    // Draw initial grid
    this.drawCanvas(ctx);
    
    // Mouse click - place brick
    canvas.addEventListener('click', (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const col = Math.floor(x / (this.brickWidth + this.padding));
      const row = Math.floor(y / (this.brickHeight + this.padding));
      
      this.editorManager.setCell(row, col, this.selectedColor);
      this.drawCanvas(ctx);
    });
    
    // Right click - delete brick
    canvas.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const col = Math.floor(x / (this.brickWidth + this.padding));
      const row = Math.floor(y / (this.brickHeight + this.padding));
      
      this.editorManager.setCell(row, col, null);
      this.drawCanvas(ctx);
    });
    
    // Color selector
    this.container.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      
// Color buttons
        if (target.classList.contains('color-btn')) {
          this.selectedColor = (target as HTMLElement).dataset.color || '#ff0044';
          document.querySelectorAll('.color-btn').forEach(btn => {
            (btn as HTMLElement).style.borderColor = '#333';
          });
          (target as HTMLElement).style.borderColor = '#fff';
        }
      
      // Control buttons
      if (target.classList.contains('btn-save')) {
        const index = this.editorManager.getCustomLevelsCount();
        this.editorManager.saveLevel(index);
        alert('Level saved!');
        this.updateSavedLevelsList();
      }
      
      if (target.classList.contains('btn-load')) {
        this.showLoadDialog();
      }
      
      if (target.classList.contains('btn-download')) {
        this.downloadLevel();
      }
      
      if (target.classList.contains('btn-load-file')) {
        this.showLoadFileDialog();
      }
      
      if (target.classList.contains('btn-clear')) {
        if (confirm('Clear current level?')) {
          this.editorManager.reset();
          this.drawCanvas(ctx);
        }
      }
      
      if (target.classList.contains('btn-play')) {
        this.playLevel();
      }
      
      if (target.classList.contains('btn-back')) {
        window.location.href = '/';
      }
      
// Level name input
        if (target.classList.contains('level-name-input')) {
          this.editorManager.setLevelName((target as HTMLInputElement).value);
        }
    });
    
    // Saved levels list events
    this.container.querySelector('.save-load-section')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('btn-load-level')) {
        const index = parseInt(target.dataset.index || '0');
        if (this.editorManager.loadLevel(index)) {
          this.drawCanvas(ctx);
        }
      }
      if (target.classList.contains('btn-delete-level')) {
        const index = parseInt(target.dataset.index || '0');
        if (confirm('Delete this level?')) {
          this.editorManager.deleteLevel(index);
          this.updateSavedLevelsList();
          this.drawCanvas(ctx);
        }
      }
    });
    
    // File input change
    const fileInput = this.container.querySelector('#level-file-input') as HTMLInputElement;
    fileInput?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.loadFromFile(file);
      }
    });
  }

  private drawCanvas(ctx: CanvasRenderingContext2D): void {
    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw grid
    for (let row = 0; row < this.editorManager.getGridSize().rows; row++) {
      for (let col = 0; col < this.editorManager.getGridSize().cols; col++) {
        const x = col * (this.brickWidth + this.padding);
        const y = row * (this.brickHeight + this.padding);
        const color = this.editorManager.getCell(row, col);
        
        // Draw brick if exists
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x + 1, y + 1, this.brickWidth - 2, this.brickHeight - 2);
        }
        
        // Draw grid lines
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, this.brickWidth, this.brickHeight);
      }
    }
  }

  private updateSavedLevelsList(): void {
    const container = this.container.querySelector('.saved-levels-list');
    if (!container) return;
    
    const levels = this.editorManager.getSavedLevels();
    
    if (levels.length === 0) {
      container.innerHTML = '<p class="no-levels">No saved levels</p>';
      return;
    }
    
    container.innerHTML = levels.map((level, index) => `
      <div class="saved-level-item">
        <span>${level.name}</span>
        <div class="level-actions">
          <button class="btn-load-level" data-index="${index}">Load</button>
          <button class="btn-delete-level" data-index="${index}">Delete</button>
        </div>
      </div>
    `).join('');
  }

  private showLoadDialog(): void {
    const levels = this.editorManager.getSavedLevels();
    
    if (levels.length === 0) {
      alert('No saved levels found. Save a level first!');
      return;
    }
    
    const index = prompt(`Enter level number to load (1-${levels.length}):`);
    if (index) {
      const numIndex = parseInt(index) - 1;
      if (numIndex >= 0 && numIndex < levels.length) {
        if (this.editorManager.loadLevel(numIndex)) {
          const ctx = (this.container.querySelector('#editorCanvas') as HTMLCanvasElement).getContext('2d')!;
          this.drawCanvas(ctx);
        }
      }
    }
  }

  private downloadLevel(): void {
    const levelData = this.editorManager.getGrid();
    const levelName = this.editorManager.getLevelName() || 'level';
    const jsonString = JSON.stringify(levelData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${levelName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private showLoadFileDialog(): void {
    const fileInput = this.container.querySelector('#level-file-input') as HTMLInputElement;
    fileInput?.click();
  }

  private loadFromFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        let grid: (string | null)[][];
        
        if (Array.isArray(data)) {
          // Old format: just the grid array
          grid = data;
        } else if (data.grid && Array.isArray(data.grid)) {
          // New format: object with grid and settings
          grid = data.grid;
          
          // Update settings if available
          if (data.settings) {
            console.log('Loaded level with settings:', data.settings);
          }
          
          // Update level name if available
          if (data.name) {
            const nameInput = this.container.querySelector('.level-name-input') as HTMLInputElement;
            if (nameInput) {
              nameInput.value = data.name;
              this.editorManager.setLevelName(data.name);
            }
          }
        } else {
          alert('Invalid level file format');
          return;
        }
        
        // Load grid data
        for (let r = 0; r < grid.length; r++) {
          for (let c = 0; c < grid[r].length; c++) {
            this.editorManager.setCell(r, c, grid[r][c]);
          }
        }
        
        this.drawCanvas((this.container.querySelector('#editorCanvas') as HTMLCanvasElement).getContext('2d')!);
        alert(`Level loaded from ${file.name}`);
      } catch (error) {
        alert('Error parsing level file: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);
  }

  getContainer(): HTMLDivElement {
    return this.container;
  }
  
  private async playLevel(): Promise<void> {
    const config = await this.getLevelConfig();
    if (!config) {
      alert('Please save a level first before playing');
      return;
    }
    
    const encoded = btoa(JSON.stringify(config));
    window.location.href = `/?customLevel=${encoded}`;
  }

  private async getLevelConfig(): Promise<import('../logic/LevelManager').LevelConfig | null> {
    const grid = this.editorManager.getGrid();
    const levelName = this.editorManager.getLevelName() || 'temp-level';
    
    try {
      const levelLoader = new LevelLoader();
      const config = levelLoader.parseLevelToConfig({
        name: levelName,
        grid,
        colors: levelLoader['extractColors'](grid),
      });
      return config;
    } catch (error) {
      console.error('Error preparing level for play:', error);
      return null;
    }
  }
  
  private detectMobile(): boolean {
    const mobileRegex = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(navigator.userAgent) || window.matchMedia('(pointer: coarse)').matches;
  }
}
