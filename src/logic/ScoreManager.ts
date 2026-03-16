export class ScoreManager {
  score: number;
  lives: number;

  constructor() {
    this.score = 0;
    this.lives = 3;
  }

  addScore(points: number) {
    this.score += points;
  }

  removeLife() {
    this.lives--;
  }

  getScore(): number {
    return this.score;
  }

  getLives(): number {
    return this.lives;
  }

  reset() {
    this.score = 0;
    this.lives = 3;
  }
}
