import './components/LevelEditor.css';
import { Game } from './engine/Game';
import { LevelEditor } from './components/LevelEditor';
import { LevelManager } from './logic/LevelManager';

const path = window.location.pathname;
const urlParams = new URLSearchParams(window.location.search);

if (path === '/editor') {
  // Show level editor
  const editor = new LevelEditor();
  document.body.appendChild(editor.getContainer());
} else {
  // Show game
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (canvas) {
    const customLevelParam = urlParams.get('customLevel');
    let levelManager: LevelManager | undefined;
    
    if (customLevelParam) {
      try {
        const configJson = atob(customLevelParam);
        const config = JSON.parse(configJson);
        levelManager = new LevelManager(0, config);
      } catch (error) {
        console.error('Error loading custom level:', error);
      }
    }
    
    const game = new Game(canvas, levelManager);
    (window as any).game = game;
    game.start();
  }
}

// Set viewport meta tag for mobile
function setViewport() {
  let viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.setAttribute('name', 'viewport');
    document.head.appendChild(viewport);
  }
  viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
}

setViewport();
