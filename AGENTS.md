# AGENTS.md - KBB Game Development Guide

## Project Overview

KBB is a TypeScript/Vite brick breaker game with power-up system, E2E testing, visual polish effects, and modern architecture.

## Tech Stack

- **Vite** 8.0.0 - Build tool and dev server
- **TypeScript** - Type-safe development
- **Playwright** - E2E testing
- **Vitest** - Unit testing
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
npm run test:unit
```

## Codebase Structure

```
src/
├── engine/
│   ├── Game.ts              # Main game class - orchestrates all systems
│   ├── GameLoop.ts          # RequestAnimationFrame loop with FPS tracking
│   └── GameState.ts         # State machine (MENU, PLAYING, PAUSED, GAMEOVER, WIN)
├── entities/
│   ├── Paddle.ts            # Player paddle with mouse/keyboard controls
│   ├── Ball.ts              # Ball physics, bouncing, lifecycle, trail effect
│   ├── Brick.ts             # Brick entity with destruction animation
│   ├── PowerUp.ts           # Power-up with rotation and pulse animation
│   └── index.ts             # Entity exports (deprecated, not used)
├── logic/
│   ├── BrickManager.ts      # 5-row brick layout, spawning
│   ├── ScoreManager.ts      # Score and lives tracking
│   ├── PowerUpManager.ts    # Power-up spawn rates, collection logic
│   ├── LevelManager.ts      # Level loading and management
│   └── LevelEditorManager.ts # Level editor grid management
├── renderer/
│   └── Renderer.ts          # Canvas drawing, HUD, menus, background stars
├── utils/
│   ├── CollisionSystem.ts   # AABB collision detection
│   ├── InputHandler.ts      # Keyboard/mouse event handling
│   ├── ParticleSystem.ts    # Particle effects for collisions
│   ├── KubernetesService.ts # K8s API communication
│   ├── AssetLoader.ts       # SVG asset loading
│   └── LevelLoader.ts       # Level JSON loading
├── components/
│   └── LevelEditor.ts       # Level editor UI component
├── types.d.ts               # Module declarations (*.json)
├── main.ts                  # Entry point, initializes Game
└── style.css                # Fullscreen canvas styling

public/
└── assets/                  # Static assets (crack.svg, etc.)

e2e/
├── unit/                    # Unit tests (moved from src/__tests__)
│   └── LevelEditorManager.test.ts
└── *.spec.ts                # Playwright E2E tests

levels/                        # JSON level configurations (level1-11.json)
```

## Mobile Optimization

### Game Speed

- **Base Speed**: 1.0 (default for both mobile and desktop)
- **Desktop**: Final speed = baseSpeed × 1.7
- **Mobile**: Final speed = baseSpeed × 0.75
- **Level Config**: `gameSpeed` in JSON is multiplied by platform factor
- **Detection**: `navigator.userAgent` regex + `window.matchMedia('(pointer: coarse)')`

### Mobile Controls

- Swipe left/right to move paddle
- Tap/click to launch ball
- Touch events use passive listeners for smooth scrolling

## Visual Effects

### Particle System
- Spawns on brick destruction and power-up collection
- Max 50 particles simultaneously
- Each particle has physics-based movement and fade-out
- Optimized with active particle tracking to prevent processing dead particles

### Ball Trail
- Smooth quadratic curve path (not individual arcs)
- Dynamic length based on speed (prevents trails from being too long at high speeds)
- Gradient opacity from front to back
- Desktop: ~9 trail points, Mobile: ~20 trail points

### Screen Shake
- Triggered on brick destruction and power-up collection
- Red bricks cause more intense shake (4px) than regular bricks (2px)
- Decay factor of 0.85 per frame

### Brick Destruction FX
- Scale animation (1.0 → 1.4 → 0)
- Fade-out opacity
- Flash effect (white overlay)
- Particle explosion
- Crack image overlay for damaged bricks

### Background Stars
- 20 stars with parallax effect
- Random sizes (0.5-2px) and speeds (0.2-0.7 px/frame)
- Opacity varies (0.3-1.0)
- Stars wrap around when off-screen

### Power-Up Animations
- Pulse effect (scale oscillation)
- Subtle rotation
- Glow with shadowBlur

### Paddle Glow
- Outer glow with shadowBlur
- Center highlight for depth
- Shake effect when hit by ball

## Key Patterns

### Game State Machine

```typescript
// States: MENU, PLAYING, PAUSED, GAMEOVER, WIN, LEVEL_COMPLETE, CUSTOM_WIN
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
// 5 power-up types: wide, multi, laser, slow, life
// Spawn rate: 5 bricks (configurable per level)
// Spawn chance: 60%
// Duration: 10 seconds for most power-ups
// Activation: Automatic on collection in Game.activatePowerUp()
```

### Laser Power-up Implementation

```typescript
// Auto-shoots every 200ms while active
// Lasers stored in array with {x, y, width, height, speed, active}
// Collision: Simple AABB against bricks
// Visual: Red glow with shadowBlur
// When laser destroys brick: triggers particle effect, shake, destruction animation
```

### FPS Performance Monitoring

```typescript
// Real-time FPS counter (toggle with backtick key)
// Performance logs to console every 10 seconds
// Tracks: FPS, particle count, ball count, power-up count
// Targets: 60+ FPS desktop, 30+ FPS mobile
```

## Important Files

### Game.ts
- Main orchestrator
- Manages: paddle, balls, bricks, power-ups, lasers, particles
- Update loop: filters inactive balls, checks win condition
- Laser cooldown: 200ms between shots
- Performance monitoring: FPS tracking, logging every 10 seconds
- Speed management: applies platform multiplier (0.75 mobile, 1.7 desktop)

### Ball.ts
- `active` flag: false when off-screen
- `launched` flag: false when attached to paddle
- `isMain` flag: tracks original ball vs. spawned balls
- Update: moves to paddle position if not launched
- Trail: dynamic length based on speed multiplier

### Brick.ts
- Red bricks have 2 health, regular bricks have 1
- `startDestroy()` triggers scale/fade animation
- `crackImage` overlay when damaged (requires AssetLoader)
- Particle explosion on destruction

### PowerUpManager.ts
- `spawnRate`: 5 bricks (configurable)
- `spawnChance`: 60%
- `lastSpawnBrickIndex`: tracks which brick spawned last (prevents timer bug)
- Debug mode: spawns all 5 types when 'D' pressed

### ParticleSystem.ts
- Max 50 particles
- Active particle tracking to prevent processing dead particles
- Optimized filtering in update loop

## Common Tasks

### Adding a New Power-up

1. Add type to `PowerUpType` in `PowerUp.ts:1`
2. Add case in `PowerUp.ts:28-49` for color/label
3. Add activation logic in `Game.ts:584-626` (`activatePowerUp`)
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
  // When laser destroys brick: triggers particle effect, shake, destruction animation
}
```

### Adding New Game State

1. Add to `GameState.ts` enum
2. Handle in `Game.ts:89-106` (keydown)
3. Add draw case in `Game.ts:646-680` (`draw`)
4. Update state machine logic

### Adjusting Game Speed

```typescript
// Level config JSON
{
  "gameSpeed": 0.5,  // Will be multiplied by 0.75 (mobile) or 1.7 (desktop)
  "ballSpeed": 5,
  "powerUpSpawnRate": 5
}

// Final execution speed:
// Desktop: 0.5 × 1.7 = 0.85
// Mobile: 0.5 × 0.75 = 0.375
```

## Testing

### Playwright Tests (e2e/*.spec.ts)

Tests cover:
- Menu navigation
- Game state transitions
- Paddle movement (keyboard + mouse)
- Ball launch
- All 5 power-ups
- Score/lives
- Pause/resume
- Game over/win conditions
- Level editor functionality
- Mobile controls
- K8s pod termination

```bash
npm run test:e2e     # Run all E2E tests
npm run test:e2e -- -g "laser"  # Run specific test
```

### Vitest Tests (e2e/unit/*.test.ts)

```bash
npm run test:unit    # Run unit tests
```

## Debugging

### Debug Mode (Press 'D' in-game)

Shows:
- Power-up locations with X markers
- Type labels for each power-up
- Spawn timer and count

### FPS Display (Press `` ` `` in-game)

Shows:
- Real-time FPS counter in top-left corner
- Performance metrics in console every 10 seconds

### Console Messages

Check browser console for:
- TypeScript compilation errors
- Runtime exceptions
- Network requests (Playwright)
- Performance logs (FPS, particle count, ball count, power-up count)

### Performance Logging

Console logs every 10 seconds show:
```
[HH:MM:SS] FPS: 60, Particles: 12, Balls: 3, PowerUps: 2
```

## Build & Deployment

### Local Development (Docker)

```bash
# Build images
make build

# Run locally
make run

# Stop and clean
make stop
make clean
```

### Kubernetes Deployment

```bash
# Quick start
make k8s

# Check status
make k8s-status

# View logs
kubectl logs -l app=k8s-middleware
kubectl logs -l app=KBB-frontend

# Port forward for testing
kubectl port-forward svc/KBB-frontend 8080:80
kubectl port-forward svc/k8s-middleware 3001:3001

# Delete deployment
make k8s-delete
```

### Docker Files

- `Dockerfile.front` - Frontend with Caddy server
- `Dockerfile.backend` - Middleware Go binary

### Kubernetes Resources

- `k8s/rbac.yaml` - ServiceAccount, Role, RoleBinding
- `k8s/middleware-deployment.yaml` - Middleware deployment & service
- `k8s/frontend-deployment.yaml` - Frontend deployment, service & ingress
- `Caddyfile` - Caddy server configuration

### Deployment Architecture

```
┌─────────────────────────────────────────┐
│          Kubernetes Cluster             │
│                                         │
│  ┌──────────────┐     ┌──────────────┐ │
│  │   Ingress    │────▶│   Frontend   │ │
│  │  (Port 80)   │     │  (Caddy)     │ │
│  └──────────────┘     └──────┬───────┘ │
│                             │          │
│                             ▼          │
│                     ┌──────────────┐  │
│                     │   Middleware │  │
│                     │   (Go)       │  │
│                     │  (Port 3001) │  │
│                     └──────────────┘  │
│                             │         │
│                             ▼         │
│                    ┌──────────────┐  │
│                    │   K8s API    │  │
│                    │  (Cluster)   │  │
│                    └──────────────┘  │
└─────────────────────────────────────────┘
```

### RBAC Permissions

Middleware has limited permissions:
- `pods`: get, list, watch, delete
- Namespace: `default` only
- Excludes: `kube-system` namespace

See `k8s/DEPLOYMENT.md` for full documentation.

## Known Issues & Fixes

1. **Power-up spawn rate too low** → Fixed: 300 bricks → 5 bricks
2. **Spawn timer incremented incorrectly** → Fixed: track lastSpawnBrickIndex
3. **Ball respawning too early** → Fixed: only spawn when balls.length === 0
4. **Laser only visual** → Fixed: added laser projectiles with collision
5. **Top wall collision** → Fixed: ball now bounces off all walls
6. **Laser not triggering destruction FX** → Fixed: added particleSystem.spawn(), triggerShake(), startDestroy()
7. **Ball trail too long on desktop** → Fixed: dynamic trail length based on speed
8. **FPS drops with visual effects** → Fixed: optimized particle system, reduced stars, simplified trails

## Code Conventions

- No comments in production code (unless complex logic)
- Clear function names (updateLasers, checkAllBallsLost)
- Type safety: all variables have explicit types
- Private methods prefixed with `this.`
- Constants at top of class
- No unused imports or dead code

## Performance Tips

- Filter arrays instead of splicing in loops
- Use requestAnimationFrame for smooth rendering
- Reuse objects where possible
- Avoid garbage collection in update loop
- Minimize ctx.save()/ctx.restore() calls
- Use single path for trails instead of multiple arcs
- Limit particle count to max 50
- Reduce background elements (20 stars instead of 60)
- Apply platform-specific speed multipliers

## Security Notes

- No external API calls (except K8s middleware)
- No user data collection
- All state in memory (no localStorage yet)
- Canvas sandboxed by browser
- K8s middleware has minimal RBAC permissions

## Future Roadmap

1. **Audio**: Web Audio API for sound effects
2. **Assets**: Sprite images for power-ups
3. **Music**: Background music system
4. **High Scores**: localStorage persistence
5. **Boss Battles**: Special brick patterns
6. **Leaderboards**: Remote high score tracking
7. **Achievements**: Unlockable badges and rewards
8. **Daily Challenges**: Random level generation

## Support

For issues:
1. Check browser console for errors
2. Run `npm run build` to verify TypeScript
3. Check Playwright tests pass
4. Review AGENTS.md for patterns
5. Check performance logs in console

## Git Workflow

- `main` - Production-ready code
- `feature/*` - Feature branches (e.g., `feature/visual-polish`)
- Always create feature branches from main
- Keep branches up to date with main
- Code review required before merging

## Environment Variables

See `.env.example` for available configuration options.

## CI/CD with GitHub Actions

### Workflows

- **`.github/workflows/docker-publish.yml`**: Builds and pushes Docker images to ghcr.io
- **`.github/workflows/deploy.yml`**: Deploys images to Kubernetes cluster

### Setup Required

1. **Add Kubernetes kubeconfig as secret**:
   ```bash
   kubectl config view --minify -o json | base64 -w 0
   # Add to GitHub Settings > Secrets > KUBECONFIG
   ```

2. **Triggers**:
   - Push to `main`/`develop` branches → auto build & deploy
   - Push of `v*` tags → semantic version tags
   - Pull requests → build only (no push)

### Manual Deployment

```bash
# Set GitHub username
export GITHUB_USER=your-username

# Build and push to ghcr.io
make ghcr

# Deploy manually
kubectl set image deployment/KBB-frontend frontend=ghcr.io/$GITHUB_USER/KBB-frontend:main -n default
kubectl set image deployment/k8s-middleware middleware=ghcr.io/$GITHUB_USER/k8s-middleware:main -n default
```

See `.github/workflows/README.md` for detailed guide.
