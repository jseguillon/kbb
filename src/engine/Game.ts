import { GameLoop } from './GameLoop';
import { GameState } from './GameState';
import { CollisionSystem } from '../utils/CollisionSystem';
import { Paddle } from '../entities/Paddle';
import { Ball } from '../entities/Ball';
import { BrickManager } from '../logic/BrickManager';
import { Renderer } from '../renderer/Renderer';
import { InputHandler } from '../utils/InputHandler';
import { ScoreManager } from '../logic/ScoreManager';
import { PowerUpManager } from '../logic/PowerUpManager';
import { LevelManager } from '../logic/LevelManager';
import type { PowerUpType } from '../entities/PowerUp';
import { Brick } from '../entities/Brick';
import { KubernetesService } from '../utils/KubernetesService';

interface Laser {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  active: boolean;
}


export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameLoop: GameLoop;
  private gameState: GameState;
  private collisionSystem: CollisionSystem;
  public paddle: Paddle;
  private balls: Ball[];
  private brickManager: BrickManager;
  private renderer: Renderer;
  private inputHandler: InputHandler;
  private scoreManager: ScoreManager;
  private powerUpManager: PowerUpManager;
  private levelManager: LevelManager | undefined;
  private hasLaser: boolean = false;
  private lasers: Laser[] = [];
  private lastLaserTime: number = 0;
  private laserCooldown: number = 200;
  private debugMode: boolean = false;

  private isRedBrick(color: string): boolean {
    const redColors = ['#ff0044', '#ff3300', '#ff0000', '#ff4400'];
    return redColors.includes(color);
  }

  get canvasHeight(): number {
    return this.canvas.height;
  }

 constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    this.gameState = GameState.createMenu();
    this.collisionSystem = new CollisionSystem();
    this.inputHandler = new InputHandler();
    this.scoreManager = new ScoreManager();
    this.renderer = new Renderer(this.ctx, canvas.width, canvas.height);
    
    this.paddle = new Paddle(canvas.width / 2, canvas.height - 40, 100, 15);
    this.balls = [];
    this.brickManager = new BrickManager(canvas.width);
    this.powerUpManager = new PowerUpManager(canvas.width, canvas.height, this);

    this.gameLoop = new GameLoop(this.update.bind(this), this.draw.bind(this));
    
    this.inputHandler.addEventListener('keydown', ((e: Event) => this.handleKeydown(e as KeyboardEvent)) as EventListener);
    this.inputHandler.addEventListener('keyup', ((e: Event) => this.handleKeyup(e as KeyboardEvent)) as EventListener);
    this.inputHandler.addEventListener('mousedown', ((e: Event) => this.handleClick(e as MouseEvent)) as EventListener);
    
    canvas.addEventListener('mousemove', (e: MouseEvent) => this.handleMouseMove(e));
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

private resize() {
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      this.renderer.setDimensions(rect.width, rect.height);
      this.paddle = new Paddle(this.paddle.x, this.canvas.height - 40, Math.min(100, this.canvas.width * 0.15), 15);
      if (!this.levelManager && this.brickManager) {
        this.levelManager = new LevelManager(0);
        this.powerUpManager = new PowerUpManager(this.canvas.width, this.canvas.height, this);
        this.loadLevel(0);
      }
    }
  }

  private handleKeydown(e: KeyboardEvent) {
    if (this.gameState.state === GameState.GameStateState.PLAYING) {
      if (e.key === 'ArrowLeft') {
        this.paddle.dx = -1;
      } else if (e.key === 'ArrowRight') {
        this.paddle.dx = 1;
      } else if (e.key === 'Escape') {
        this.gameState = GameState.createPaused();
      } else if (e.key === ' ' || e.key === 'Enter') {
        this.launchBalls();
        e.preventDefault();
      } else if (e.key.toLowerCase() === 'd') {
        this.toggleDebugMode();
        e.preventDefault();
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
    }

    switch (this.gameState.state) {
      case GameState.GameStateState.MENU:
        if (e.key === 'Enter' || e.key === ' ') {
          this.startGame();
        }
        break;
      case GameState.GameStateState.PAUSED:
        if (e.key === 'Escape') {
          this.gameState = GameState.createPlaying();
        }
        break;
      case GameState.GameStateState.LEVEL_COMPLETE:
        if (e.key === 'Enter' || e.key === ' ') {
          this.levelManager!.nextLevel();
          this.loadLevel(this.levelManager!.getCurrentLevel() - 1);
          this.balls = [new Ball(this.canvas.width / 2, this.canvas.height - 60, 8, true)];
          this.gameState = GameState.createPlaying();
          this.scoreManager.addScore(500);
        }
        break;
      case GameState.GameStateState.GAMEOVER:
      case GameState.GameStateState.WIN:
        if (e.key === 'Enter' || e.key === ' ') {
          this.startGame();
        }
        break;
    }
  }

  private handleKeyup(e: KeyboardEvent) {
    if (this.gameState.state === GameState.GameStateState.PLAYING) {
      if (e.key === 'ArrowLeft') {
        this.paddle.dx = 0;
      } else if (e.key === 'ArrowRight') {
        this.paddle.dx = 0;
      }
    }
  }

  private handleClick(_e: MouseEvent) {
    switch (this.gameState.state) {
      case GameState.GameStateState.MENU:
        this.startGame();
        break;
      case GameState.GameStateState.PLAYING:
        this.launchBalls();
        break;
      case GameState.GameStateState.PAUSED:
        this.gameState = GameState.createPlaying();
        break;
      case GameState.GameStateState.GAMEOVER:
      case GameState.GameStateState.WIN:
        this.startGame();
        break;
    }
  }

  private handleMouseMove(e: MouseEvent) {
    const mouseX = e.clientX - this.canvas.getBoundingClientRect().left;
    this.paddle.moveTo(mouseX, this.canvas);
  }

  private startGame() {
    this.gameState = GameState.createPlaying();
    this.paddle = new Paddle(this.canvas.width / 2, this.canvas.height - 40, Math.min(100, this.canvas.width * 0.15), 15);
    this.levelManager = new LevelManager(0);
    this.renderer.setTotalLevels(this.levelManager.getTotalLevels());
    this.balls = [new Ball(this.canvas.width / 2, this.canvas.height - 60, 8, true)];
    this.loadLevel(0);
    this.scoreManager.reset();
    this.powerUpManager.reset();
    this.hasLaser = false;
    this.lasers = [];
    this.lastLaserTime = 0;
  }

  private loadLevel(_levelIndex: number): void {
    const config = this.levelManager!.getCurrentConfig();
    this.brickManager = new BrickManager(this.canvas.width, config);
    this.powerUpManager = new PowerUpManager(this.canvas.width, this.canvas.height, this, config.powerUpSpawnRate);
    this.hasLaser = false;
    this.lasers = [];
    this.balls.forEach(ball => (ball.speed = config.ballSpeed));
    this.renderer.setLevel(this.levelManager!.getCurrentLevel(), this.levelManager!.getTotalLevels());
  }

  private launchBalls(): void {
    this.balls.forEach(ball => ball.launch());
  }

  private toggleDebugMode(): void {
    this.debugMode = !this.debugMode;
    if (this.debugMode) {
      // Spawn all power-up types for debug visualization (they'll fall)
      this.powerUpManager.spawnAllDebug();
    } else {
      // Remove debug power-ups when disabling debug mode
      this.powerUpManager.removeDebugPowerUps();
    }
  }

  private update() {
    if (this.gameState.state !== GameState.GameStateState.PLAYING) return;

    this.paddle.update(this.canvas.width);
    this.powerUpManager.update();
    this.powerUpManager.checkPaddleCollision(this.paddle);

    this.updateLasers();
    this.updateBalls();

    if (this.brickManager.brickList.length === 0) {
      this.handleLevelComplete();
    }

    this.renderer.setScore(this.scoreManager.getScore());
    this.renderer.setLives(this.scoreManager.getLives());
  }

  private updateBalls() {
    this.balls.forEach(ball => ball.update(this, this.canvasHeight));
    this.balls = this.balls.filter(ball => ball.active);

    this.balls.forEach(ball => {
      if (this.collisionSystem.checkPaddleCollision(this.paddle, ball)) {
        ball.bounceOffPaddle(this.paddle);
      }

      if (this.collisionSystem.checkWallCollision(ball, this.canvas.width, this.canvas.height)) {
        ball.bounceOffWall(0);
      }

      const hitBrick = this.collisionSystem.checkBrickCollision(ball, this.brickManager.brickList);
      if (hitBrick) {
        ball.bounceOffBrick(hitBrick);
        this.brickManager.removeBrick(hitBrick);
        this.scoreManager.addScore(10);
        this.trySpawnPowerUp(hitBrick);
        if (this.isRedBrick(hitBrick.color)) {
          KubernetesService.terminateRandomPod();
        }
      }
    });

    if (this.balls.length === 0) {
      this.checkAllBallsLost();
    }
  }

  private updateLasers() {
    if (!this.hasLaser) {
      this.lasers = this.lasers.filter(laser => laser.active);
      return;
    }

    const now = Date.now();
    if (now - this.lastLaserTime > this.laserCooldown) {
      const laserX = this.paddle.x + this.paddle.width / 2 - 2;
      this.lasers.push({
        x: laserX,
        y: this.paddle.y - 20,
        width: 4,
        height: 15,
        speed: 8,
        active: true
      });
      this.lastLaserTime = now;
    }

    this.lasers.forEach(laser => {
      laser.y -= laser.speed;
      if (laser.y < 0) {
        laser.active = false;
      }
    });

    this.lasers = this.lasers.filter(laser => laser.active);

    this.lasers.forEach(laser => {
      const hitBrick = this.brickManager.brickList.find(brick =>
        laser.x < brick.x + brick.width &&
        laser.x + laser.width > brick.x &&
        laser.y < brick.y + brick.height &&
        laser.y + laser.height > brick.y
      );

      if (hitBrick) {
        laser.active = false;
        this.brickManager.removeBrick(hitBrick);
        this.scoreManager.addScore(10);
        this.trySpawnPowerUp(hitBrick);
        if (this.isRedBrick(hitBrick.color)) {
          KubernetesService.terminateRandomPod();
        }
      }
    });
  }

  private checkAllBallsLost(): void {
    this.scoreManager.removeLife();
    
    if (this.scoreManager.getLives() <= 0) {
      this.gameState = GameState.createGameOver();
    } else {
      this.balls = [new Ball(this.canvas.width / 2, this.canvas.height - 60, 8, true)];
    }
  }

  private trySpawnPowerUp(brick: Brick): void {
    const brickIndex = this.brickManager.brickList.indexOf(brick);
    if (this.powerUpManager.shouldSpawn(brickIndex)) {
      this.powerUpManager.spawn(brick.x + brick.width / 2, brick.y);
    }
  }

  public activatePowerUp(type: PowerUpType): void {
    switch (type) {
      case 'wide':
        this.paddle.width = Math.min(this.paddle.width * 1.5, 200);
        setTimeout(() => {
          this.paddle.width = Math.max(this.paddle.width * 0.66, 60);
        }, 10000);
        break;
      case 'slow':
        this.balls.forEach(ball => {
          ball.speed = 3;
        });
        setTimeout(() => {
          this.balls.forEach(ball => {
            ball.speed = 5;
          });
        }, 10000);
        break;
      case 'laser':
        this.hasLaser = true;
        setTimeout(() => {
          this.hasLaser = false;
        }, 10000);
        break;
      case 'spread':
        const mainBall = this.balls.find(b => b.isMain);
        if (mainBall && mainBall.launched) {
          const newBall1 = new Ball(mainBall.x, mainBall.y, 6, false);
          const newBall2 = new Ball(mainBall.x, mainBall.y, 6, false);
          newBall1.dx = mainBall.dx * 0.7;
          newBall1.dy = mainBall.dy * 0.7;
          newBall2.dx = mainBall.dx * 0.5;
          newBall2.dy = mainBall.dy * 0.5;
          this.balls.push(newBall1, newBall2);
        }
        break;
      case 'life':
        this.scoreManager.addLife();
        break;
      case 'multi':
        if (this.balls.filter(b => b.launched).length < 3) {
          const mainBall = this.balls.find(b => b.isMain);
          if (mainBall) {
            const newBall = new Ball(mainBall.x, mainBall.y, 6, false);
            newBall.dx = -mainBall.dx * 0.5;
            newBall.dy = mainBall.dy;
            this.balls.push(newBall);
          }
        }
        break;
    }
  }

  private draw() {
    this.renderer.clear();

    if (this.gameState.state === GameState.GameStateState.MENU) {
      this.renderer.drawMenu();
    } else if (this.gameState.state === GameState.GameStateState.PLAYING) {
      this.brickManager.draw(this.renderer.ctx);
      this.powerUpManager.draw(this.renderer.ctx);
      this.paddle.draw(this.renderer.ctx);
      this.balls.forEach(ball => ball.draw(this.renderer.ctx));
      this.drawLaser();
      this.drawDebugInfo();
      this.renderer.drawHUD();
    } else if (this.gameState.state === GameState.GameStateState.PAUSED) {
      this.brickManager.draw(this.renderer.ctx);
      this.powerUpManager.draw(this.renderer.ctx);
      this.paddle.draw(this.renderer.ctx);
      this.balls.forEach(ball => ball.draw(this.renderer.ctx));
      this.drawDebugInfo();
      this.renderer.drawPaused();
    } else if (this.gameState.state === GameState.GameStateState.LEVEL_COMPLETE) {
      this.renderer.drawLevelComplete();
    } else if (this.gameState.state === GameState.GameStateState.GAMEOVER) {
      this.renderer.drawGameOver();
    } else if (this.gameState.state === GameState.GameStateState.WIN) {
      this.renderer.drawWin();
    }
  }

  private drawLaser(): void {
    if (!this.hasLaser) return;

    this.lasers.forEach(laser => {
      this.renderer.ctx.fillStyle = '#ff4400';
      this.renderer.ctx.shadowColor = '#ff4400';
      this.renderer.ctx.shadowBlur = 15;
      
      this.renderer.ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
    });

    this.renderer.ctx.shadowBlur = 0;
  }

  private handleLevelComplete(): void {
    if (this.levelManager!.nextLevel()) {
      this.gameState = GameState.createLevelComplete();
    } else {
      this.gameState = GameState.createWin();
    }
  }

  private drawDebugInfo(): void {
    if (!this.debugMode) return;

    // Draw debug text
    this.renderer.ctx.fillStyle = '#ffffff';
    this.renderer.ctx.font = 'bold 16px Arial';
    this.renderer.ctx.textAlign = 'left';
    this.renderer.ctx.fillText('DEBUG MODE - Power-up locations', 10, 20);

    // Draw all power-up locations with X markers
    this.renderer.ctx.fillStyle = '#ff00ff';
    this.renderer.ctx.font = 'bold 14px Arial';
    this.renderer.ctx.textAlign = 'center';

    this.powerUpManager.powerUps.forEach(powerUp => {
      // Draw X marker
      const x = powerUp.x + powerUp.width / 2;
      const y = powerUp.y + powerUp.height / 2;
      const size = 8;

      this.renderer.ctx.beginPath();
      this.renderer.ctx.moveTo(x - size, y - size);
      this.renderer.ctx.lineTo(x + size, y + size);
      this.renderer.ctx.moveTo(x + size, y - size);
      this.renderer.ctx.lineTo(x - size, y + size);
      this.renderer.ctx.strokeStyle = '#ff00ff';
      this.renderer.ctx.lineWidth = 2;
      this.renderer.ctx.stroke();

      // Draw power-up type label
      this.renderer.ctx.fillText(powerUp.type.toUpperCase(), x, y - 12);
    });

    // Draw stats
    this.renderer.ctx.fillStyle = '#00ffff';
    this.renderer.ctx.font = '14px Arial';
    this.renderer.ctx.textAlign = 'left';
    this.renderer.ctx.fillText(`Power-ups on screen: ${this.powerUpManager.powerUps.length}`, 10, 40);
    this.renderer.ctx.fillText(`Spawn timer: ${this.getSpawnTimer()}/${this.getSpawnRate()}`, 10, 60);
  }

  private getSpawnTimer(): number {
    return (this.powerUpManager as any).spawnTimer;
  }

  private getSpawnRate(): number {
    return (this.powerUpManager as any).spawnRate;
  }

  start() {
    this.gameLoop.start();
  }

  stop() {
    this.gameLoop.stop();
  }
}
