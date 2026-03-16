# AGENTS.md - Arkanoid Game Development Guide

## Project Overview

Arkanoid is a TypeScript/Vite brick breaker game with power-up system, E2E testing, and modern architecture.

## Tech Stack

- **Vite** 8.0.0 - Build tool and dev server
- **TypeScript** - Type-safe development
- **Playwright** - E2E testing
- **Canvas API** - 2D rendering
- **Node.js** - Runtime (LTS recommended)

## Quick Start for Agents

```bash
# Setup
nvm use --lts 2>/dev/null || true
npm install

# Dev
npm run dev

# Build
npm run build

# Test
npm run test:e2e
```

## Codebase Structure

```
src/
├── engine/
│   ├── Game.ts              # Main game class - orchestrates all systems
│   ├── GameLoop.ts          # RequestAnimationFrame loop
│   └── GameState.ts         # State machine (MENU, PLAYING, PAUSED, GAMEOVER, WIN)
├── entities/
│   ├── Paddle.ts            # Player paddle with mouse/keyboard controls
│   ├── Ball.ts              # Ball physics, bouncing, lifecycle
│   ├── Brick.ts             # Brick entity
│   ├── PowerUp.ts           # Power-up with 5 types (wide, multi, laser, slow, spread)
│   └── index.ts             # Entity exports
├── logic/
│   ├── BrickManager.ts      # 5-row brick layout, spawning
│   ├── ScoreManager.ts      # Score and lives tracking
│   └── PowerUpManager.ts    # Power-up spawn rates, collection logic
├── renderer/
│   └── Renderer.ts          # Canvas drawing, HUD, menus
├── utils/
│   ├── CollisionSystem.ts   # AABB collision detection
│   └── InputHandler.ts      # Keyboard/mouse event handling
├── main.ts                  # Entry point, initializes Game
└── style.css                # Fullscreen canvas styling
```

## Key Patterns

### Game State Machine

```typescript
// States: MENU, PLAYING, PAUSED, GAMEOVER, WIN
// Only PLAYING state runs update loop
if (this.gameState.state !== GameState.GameStateState.PLAYING) return;
```

### Entity Lifecycle

```typescript
// Ball lifecycle:
// 1. Created unlaunched (attached to paddle)
// 2. Launch on space/click (becomes active)
// 3. Update position each frame
// 4. Set active=false when off-screen
// 5. Filtered out when balls.length === 0 → lose life
```

### Power-up System

```typescript
// 5 power-up types: wide, multi, laser, slow, spread
// Spawn rate: 5 bricks, 60% chance (after fix)
// Duration: 10 seconds for most power-ups
// Activation: Automatic on collection in Game.activatePowerUp()
```

### Laser Power-up Implementation

```typescript
// Auto-shoots every 200ms while active
// Lasers stored in array with {x, y, width, height, speed, active}
// Collision: Simple AABB against bricks
// Visual: Red glow with shadowBlur
```

## Important Files

### Game.ts
- Main orchestrator
- Manages: paddle, balls, bricks, power-ups, lasers
- Update loop: filters inactive balls, checks win condition
- Laser cooldown: 200ms between shots

### Ball.ts
- `active` flag: false when off-screen
- `launched` flag: false when attached to paddle
- `isMain` flag: tracks original ball vs. spawned balls
- Update: moves to paddle position if not launched

### PowerUpManager.ts
- `spawnRate`: 5 bricks
- `spawnChance`: 60%
- `lastSpawnBrickIndex`: tracks which brick spawned last (prevents timer bug)
- Debug mode: spawns all 5 types when 'D' pressed

## Common Tasks

### Adding a New Power-up

1. Add type to `PowerUpType` in `PowerUp.ts:1`
2. Add case in `PowerUp.ts:25-46` for color/label
3. Add activation logic in `Game.ts:229-277` (`activatePowerUp`)
4. Add to spawn array in `PowerUpManager.ts:42` or `56`

### Changing Spawn Rates

```typescript
// PowerUpManager.ts
private spawnRate: number = 5;  // Every N bricks
private spawnChance: number = 0.6; // 60% chance
```

### Modifying Laser Behavior

```typescript
// Game.ts
private laserCooldown: number = 200; // ms between shots
private updateLasers(): void {
  // Spawns lasers, updates positions, checks collision
}
```

### Adding New Game State

1. Add to `GameState.ts` enum
2. Handle in `Game.ts:89-106` (keydown)
3. Add draw case in `Game.ts:279-304` (`draw`)
4. Update state machine logic

## Testing

### Playwright Tests (e2e/arkanoid.spec.ts)

Tests cover:
- Menu navigation
- Game state transitions
- Paddle movement (keyboard + mouse)
- Ball launch
- All 5 power-ups
- Score/lives
- Pause/resume
- Game over/win conditions

```bash
npm run test:e2e     # Run all tests
npm run test:e2e -- -g "laser"  # Run specific test
```

## Debugging

### Debug Mode (Press 'D' in-game)

Shows:
- Power-up locations with X markers
- Type labels for each power-up
- Spawn timer and count

### Console Messages

Check browser console for:
- TypeScript compilation errors
- Runtime exceptions
- Network requests (Playwright)

## Build & Deployment

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type check
npm run typecheck

# Lint (if configured)
npm run lint
```

## Known Issues & Fixes

1. **Power-up spawn rate too low** → Fixed: 300 bricks → 5 bricks
2. **Spawn timer incremented incorrectly** → Fixed: track lastSpawnBrickIndex
3. **Ball respawning too early** → Fixed: only spawn when balls.length === 0
4. **Laser only visual** → Fixed: added laser projectiles with collision
5. **Top wall collision** → Fixed: ball now bounces off all walls

## Code Conventions

- No comments in production code (unless complex logic)
- Clear function names (updateLasers, checkAllBallsLost)
- Type safety: all variables have explicit types
- Private methods prefixed with `this.`
- Constants at top of class

## Performance Tips

- Filter arrays instead of splicing in loops
- Use requestAnimationFrame for smooth rendering
- Reuse objects where possible
- Avoid garbage collection in update loop

## Security Notes

- No external API calls
- No user data collection
- All state in memory (no localStorage yet)
- Canvas sandboxed by browser

## Future Roadmap

1. **Audio**: Web Audio API for sound effects
2. **Particles**: Collision particle effects
3. **Assets**: Sprite images for power-ups
4. **Music**: Background music system
5. **High Scores**: localStorage persistence
6. **Boss Battles**: Special brick patterns

## Support

For issues:
1. Check browser console for errors
2. Run `npm run build` to verify TypeScript
3. Check Playwright tests pass
4. Review AGENTS.md for patterns

## References

- [Vite Docs](https://vitejs.dev)
- [Playwright Docs](https://playwright.dev)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [TypeScript](https://www.typescriptlang.org)
