import { PowerUp } from '../entities/PowerUp';
import type { PowerUpType } from '../entities/PowerUp';
import type { Game } from '../engine/Game';
import { Paddle } from '../entities/Paddle';

export class PowerUpManager {
  powerUps: PowerUp[];
  spawnRate: number;
  public spawnTimer: number;
  gameWidth: number;
  gameHeight: number;
  private game: Game | null = null;
  private lastSpawnBrickIndex: number = -1;

  constructor(gameWidth: number, gameHeight: number, game: Game | null = null) {
    this.powerUps = [];
    this.spawnRate = 5; // Check every 5 bricks destroyed
    this.spawnTimer = 0;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.game = game;
    this.lastSpawnBrickIndex = -1;
  }

  shouldSpawn(brickIndex: number): boolean {
    // Reset spawn chance when we move to a new brick
    if (brickIndex !== this.lastSpawnBrickIndex) {
      this.spawnTimer = 0;
      this.lastSpawnBrickIndex = brickIndex;
    }

    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnRate) {
      this.spawnTimer = 0;
      return Math.random() < 0.6; // 60% chance to spawn when brick is destroyed
    }
    return false;
  }

  spawnAllDebug(): void {
    // Spawn all power-up types at random positions for debug visualization
    const types: PowerUpType[] = ['wide', 'multi', 'laser', 'slow', 'spread'];
    types.forEach(type => {
      const x = 50 + Math.random() * (this.gameWidth - 100);
      const y = 80 + Math.random() * 100;
      this.powerUps.push(new PowerUp(x, y, type, true));
    });
  }

  removeDebugPowerUps(): void {
    // Remove only debug-spawned power-ups
    this.powerUps = this.powerUps.filter(powerUp => !powerUp.isDebug);
  }

  spawn(x: number, y: number): void {
    const types: PowerUpType[] = ['wide', 'multi', 'laser', 'slow', 'spread'];
    const type = types[Math.floor(Math.random() * types.length)];
    this.powerUps.push(new PowerUp(x, y, type, false));
  }

  update(): void {
    this.powerUps.forEach(powerUp => {
      powerUp.update();
      
      // Remove if off screen
      if (powerUp.y > this.gameHeight) {
        powerUp.active = false;
      }
    });

    this.powerUps = this.powerUps.filter(powerUp => powerUp.active);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.powerUps.forEach(powerUp => powerUp.draw(ctx));
  }

  checkPaddleCollision(paddle: Paddle): void {
    this.powerUps.forEach(powerUp => {
      if (
        powerUp.active &&
        powerUp.x < paddle.x + paddle.width &&
        powerUp.x + powerUp.width > paddle.x &&
        powerUp.y < paddle.y + paddle.height &&
        powerUp.y + powerUp.height > paddle.y
      ) {
        powerUp.active = false;
        this.activatePowerUp(powerUp.type, paddle);
      }
    });
  }

  private activatePowerUp(_type: PowerUpType, _paddle: Paddle): void {
    if (this.game) {
      this.game.activatePowerUp(_type);
    }
  }

  reset(): void {
    this.powerUps = [];
    this.spawnTimer = 0;
  }
}
