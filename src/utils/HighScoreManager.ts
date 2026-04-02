export interface HighScore {
  name: string;
  score: number;
  date: string;
}

export class HighScoreManager {
  private static STORAGE_KEY = 'kbb_highscores';
  private static MAX_SCORES = 5;

  static getHighScores(): HighScore[] {
    const stored = localStorage.getItem(HighScoreManager.STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static addHighScore(score: number, name: string = 'Player'): void {
    const scores = this.getHighScores();
    const newScore: HighScore = {
      name,
      score,
      date: new Date().toISOString()
    };

    scores.push(newScore);
    scores.sort((a, b) => b.score - a.score);
    scores.splice(HighScoreManager.MAX_SCORES);

    localStorage.setItem(HighScoreManager.STORAGE_KEY, JSON.stringify(scores));
  }

  static getTopScores(): HighScore[] {
    return this.getHighScores();
  }

  static clearHighScores(): void {
    localStorage.removeItem(HighScoreManager.STORAGE_KEY);
  }

  static formatScore(score: number): string {
    return score.toLocaleString();
  }
}
