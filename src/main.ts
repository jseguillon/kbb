import { Game } from './engine/Game';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

if (canvas) {
  const game = new Game(canvas);
  game.start();
}
