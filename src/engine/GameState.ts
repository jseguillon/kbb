export class GameState {
  static readonly GameStateState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAMEOVER: 'gameover',
    WIN: 'win',
  } as const;

  state: typeof GameState.GameStateState[keyof typeof GameState.GameStateState];

  constructor(state: typeof GameState.GameStateState[keyof typeof GameState.GameStateState]) {
    this.state = state;
  }

  static createMenu(): GameState {
    return new GameState(GameState.GameStateState.MENU);
  }

  static createPlaying(): GameState {
    return new GameState(GameState.GameStateState.PLAYING);
  }

  static createPaused(): GameState {
    return new GameState(GameState.GameStateState.PAUSED);
  }

  static createGameOver(): GameState {
    return new GameState(GameState.GameStateState.GAMEOVER);
  }

  static createWin(): GameState {
    return new GameState(GameState.GameStateState.WIN);
  }
}
