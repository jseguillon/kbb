import { Game } from './engine/Game';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

if (canvas) {
  const game = new Game(canvas);
  (window as any).game = game;
  game.start();
}
