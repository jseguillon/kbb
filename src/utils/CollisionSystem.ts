import { Ball } from '../entities/Ball';
import { Paddle } from '../entities/Paddle';
import { Brick } from '../entities/Brick';

export class CollisionSystem {
  checkPaddleCollision(paddle: Paddle, ball: Ball): boolean {
    return (
      ball.x + ball.radius > paddle.x &&
      ball.x - ball.radius < paddle.x + paddle.width &&
      ball.y + ball.radius > paddle.y &&
      ball.y - ball.radius < paddle.y + paddle.height
    );
  }

  checkWallCollision(ball: Ball, canvasWidth: number, _canvasHeight: number): boolean {
    return (
      ball.x + ball.radius > canvasWidth ||
      ball.x - ball.radius < 0 ||
      ball.y - ball.radius < 0
    );
  }

  checkBottomCollision(ball: Ball, canvasHeight: number): boolean {
    return ball.y + ball.radius > canvasHeight;
  }

  checkBrickCollision(ball: Ball, bricks: Brick[]): Brick | null {
    for (const brick of bricks) {
      if (!brick.active) continue;

      if (
        ball.x + ball.radius > brick.x &&
        ball.x - ball.radius < brick.x + brick.width &&
        ball.y + ball.radius > brick.y &&
        ball.y - ball.radius < brick.y + brick.height
      ) {
        return brick;
      }
    }
    return null;
  }
}
