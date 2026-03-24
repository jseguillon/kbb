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

## Mobile Optimization

### Game Speed

- **Desktop**: Default game speed 0.5 (50%)
- **Mobile**: Automatic detection via user agent and touch capability
- **Mobile Speed**: 0.75 (75%) - 25% faster for better mobile gameplay
- Detection: `navigator.userAgent` regex + `window.matchMedia('(pointer: coarse)')`

### Mobile Controls

- Swipe left/right to move paddle
- Tap/click to launch ball
- Touch events use passive listeners for smooth scrolling

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
kubectl logs -l app=arkanoid-frontend

# Port forward for testing
kubectl port-forward svc/arkanoid-frontend 8080:80
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

## Kubernetes Deployment

### Files Created

**Dockerfiles:**
- `Dockerfile.front` - Multi-stage build with Caddy server
- `Dockerfile.backend` - Go binary for middleware

**Kubernetes Manifests:**
- `k8s/rbac.yaml` - ServiceAccount, Role, RoleBinding for pod management
- `k8s/middleware-deployment.yaml` - Middleware deployment with health checks
- `k8s/frontend-deployment.yaml` - Frontend deployment, service & ingress
- `Caddyfile` - Caddy server configuration

**Documentation:**
- `k8s/DEPLOYMENT.md` - Complete deployment guide
- `K8S_QUICKSTART.md` - Quick start guide
- `.env.example` - Environment variables template

### RBAC Security

The middleware has minimal required permissions:
```yaml
resources: ["pods"]
verbs: ["get", "list", "watch", "delete"]
```

- Only operates in `default` namespace
- Excludes `kube-system` namespace
- Cannot modify pod specs or access secrets

### Health Checks

Both deployments include:
- **Liveness probe**: `/health` endpoint (frontend), `/status` (middleware)
- **Readiness probe**: `/health` endpoint
- **Resource limits**: 64-128Mi memory, 50-100m CPU

### Caddy Server Features

- Automatic compression (gzip, br, zstd)
- CORS headers for API proxy
- Static file serving from `/app/dist`
- Health check endpoint at `/health`
- API proxy to middleware at `/api/v1/pod/terminate`

### Middleware API Endpoints

- `GET /status` - Returns cluster status and running pod count
- `DELETE /api/v1/pod/terminate` - Terminates random running pod

### Common Operations

```bash
# Deploy
make k8s

# Port forward for testing
kubectl port-forward svc/arkanoid-frontend 8080:80

# Check logs
kubectl logs -l app=k8s-middleware -f

# Scale manually (if using HPA)
kubectl scale deployment arkanoid-frontend --replicas=3
```

### Production Considerations

1. **Kubeconfig Access**: Mount as secret, not ConfigMap
2. **Image Registry**: Use private registry for production images
3. **Network Policies**: Restrict middleware access to frontend only
4. **PodDisruptionBudget**: Ensure high availability during upgrades
5. **Horizontal Pod Autoscaler**: Scale based on CPU/memory usage

See `k8s/DEPLOYMENT.md` for detailed production guide.

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
kubectl set image deployment/arkanoid-frontend frontend=ghcr.io/$GITHUB_USER/arkanoid-frontend:main -n default
kubectl set image deployment/k8s-middleware middleware=ghcr.io/$GITHUB_USER/k8s-middleware:main -n default
```

See `.github/workflows/README.md` for detailed guide.
