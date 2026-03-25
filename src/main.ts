import { Game } from './engine/Game';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

if (canvas) {
  const game = new Game(canvas);
  (window as any).game = game;
  game.start();
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
