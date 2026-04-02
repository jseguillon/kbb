# KBB Brick Breaker Game

A modern, browser-based brick breaker game that can destroy Pods on your Kubernetes cluster !

Entirely vibe coded with Open Code and Qwen 3.5 35B A3. Not a single human line of code !!

## Demo

Play the game online at: **https://jseguillon.github.io/kbb/?simulate=true**

### Create Your Own Level via the Editor

Anyone can create and submit a custom level! Here's how:

1. Visit the level editor at **https://jseguillon.github.io/kbb/?editor=true**
2. Use the editor to design your level:
   - Click or drag to place bricks
   - Right-click or drag to erase bricks
   - Adjust game speed, laser cooldown, and power-up probabilities
3. Save your level and download the JSON file
4. Submit a Pull Request with your level file in the `src/levels/` directory

**Important**: If your level grid creates a product name, it must be a CNCF (Cloud Native Computing Foundation) project.


## Getting Started

### Prerequisites

- Node.js 18+ (recommended to use nvm)
- Go 1.21+ (for K8s middleware)
- Modern web browser with Canvas support
- Kubernetes config (~/.kube/config) for K8s middleware

### Installation

```bash
# Use LTS version of Node.js
nvm use --lts 2>/dev/null || true

# Install dependencies
npm install

# Build K8s middleware (optional, for pod termination feature)
cd k8s-middleware
go build -o k8s-middleware main.go
cd ..

# Start development server
npm run dev

# Start K8s middleware in another terminal (optional)
./k8s-middleware

# Build for production
npm run build

# Run E2E tests
npm run test:e2e
```

### Playing the Game

1. Open `http://localhost:5173` in your browser
2. Click or press Enter to start the game
3. Move paddle with arrow keys or mouse
4. Press Space/Enter to launch the ball
5. Destroy all bricks to win!

## Game Architecture

```
src/
├── engine/           # Core game engine
│   ├── Game.ts      # Main game class (state management, update loop)
│   ├── GameLoop.ts  # Animation frame loop
│   └── GameState.ts # Game state machine (MENU, PLAYING, PAUSED, GAMEOVER, WIN)
├── entities/        # Game objects
│   ├── Paddle.ts    # Player-controlled paddle
│   ├── Ball.ts      # Bouncing ball with physics
│   ├── Brick.ts     # Destructible brick
│   └── PowerUp.ts   # Power-up items
├── logic/           # Game logic managers
│   ├── BrickManager.ts  # Brick layout and management
│   ├── ScoreManager.ts  # Score and lives tracking
│   └── PowerUpManager.ts # Power-up spawning and collection
├── renderer/        # Rendering
│   └── Renderer.ts  # Canvas rendering
├── utils/           # Utilities
│   ├── CollisionSystem.ts # Collision detection
│   └── InputHandler.ts    # Keyboard/mouse input handling
└── main.ts          # Entry point
```

## Technical Stack

- **Vite**: Fast build tool and dev server
- **TypeScript**: Type-safe JavaScript
- **Canvas API**: 2D rendering
- **Playwright**: E2E testing framework
- **CSS**: Responsive styling

## Testing

Run the Playwright E2E tests:

```bash
npm run test:e2e
```

Tests cover:
- Game state transitions (menu → playing → gameover/win)
- Paddle movement (keyboard and mouse)
- Ball launch mechanics
- Power-up activation (all 5 types)
- Score and lives tracking
- Pause/resume functionality

## Features

- **Core Gameplay**: Classic brick breaker mechanics with paddle, ball, and destructible bricks
- **Power-up System**: 5 unique power-ups that activate when collected:
  - **W (Wide)**: Expands paddle width by 50% for 10 seconds
  - **M (Multi)**: Splits the main ball into additional balls
  - **L (Laser)**: Automatically shoots lasers from paddle to destroy bricks (200ms cooldown)
  - **S (Slow)**: Reduces ball speed by 40% for 10 seconds
  - **P (Spread)**: Creates 2 additional balls with reduced velocity
- **Multiple Balls**: Support for multiple simultaneous balls (up to 3)
- **Score & Lives**: Track your score and remaining lives (3 starting lives)
- **Debug Mode**: Press 'D' to visualize power-up spawn locations
- **Pause Functionality**: Press ESC to pause/resume the game
- **Responsive Design**: Adapts to different screen sizes
- **E2E Testing**: Comprehensive Playwright tests for reliability

## Controls

| Key/Action | Function |
|------------|----------|
| Arrow Left/Right | Move paddle (keyboard) |
| Mouse Move | Move paddle (mouse) |
| Space/Enter/Click | Launch ball(s) |
| ESC | Pause/Resume game |
| D | Toggle debug mode (show power-up locations) |

## Development

### Project Structure

- All game logic is in `src/`
- Tests are in `e2e/`
- Configuration files at root

### Code Style

- TypeScript strict mode enabled
- No inline comments in production code
- Clear function and variable names
- Consistent formatting with Prettier

## Future Enhancements

- [ ] Sound effects (Web Audio API)
- [X] Particle effects for collisions
- [ ] Multiple levels with increasing difficulty
- [X] Power-up sprites and icons
- [ ] Background music
- [X] High score persistence (localStorage)

## License

MIT
