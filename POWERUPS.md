# Arkanoid - Power-Up Features

## Overview
Added a comprehensive power-up system with 5 different bonus types that can drop from destroyed bricks.

## Power-Up Types

### 1. Wide Paddle (W) - Cyan
- **Effect**: Increases paddle width by 50% for 10 seconds
- **Benefit**: Easier to catch the ball
- **Visual**: Cyan box with "W" label

### 2. Multi-Ball (M) - Magenta
- **Effect**: Splits main ball into 2 additional smaller balls
- **Benefit**: Increased coverage and score potential
- **Limit**: Maximum 3 balls active at once
- **Visual**: Magenta box with "M" label

### 3. Laser (L) - Orange
- **Effect**: Adds a laser beam extending upward from the paddle
- **Benefit**: Can destroy bricks above the paddle
- **Duration**: 10 seconds
- **Visual**: Orange beam rendering

### 4. Slow Ball (S) - Green
- **Effect**: Reduces ball speed to 3 (from 5)
- **Benefit**: More time to react and control gameplay
- **Duration**: 10 seconds
- **Visual**: Green box with "S" label

### 5. Spread (P) - Yellow
- **Effect**: Splits the main ball into 2 additional balls at different angles
- **Benefit**: Creates a spread pattern for better coverage
- **Visual**: Yellow box with "P" label

## Power-Up System Details

### Spawning
- 25% chance to spawn when a brick is destroyed
- Spawn rate: Every 300 bricks destroyed
- Random position above the destroyed brick
- Falls downward at speed of 3

### Activation
- Power-ups activate when collected by the paddle
- Effects are temporary (10 seconds for most)
- Wide paddle has a minimum width of 60px

## Code Changes

### New Files
- `src/entities/PowerUp.ts` - Power-up entity class
- `src/logic/PowerUpManager.ts` - Manages spawning and collection

### Modified Files
- `src/engine/Game.ts` - Integrated power-up system
- `src/entities/Ball.ts` - Added support for multiple balls
- `src/entities/index.ts` - Export PowerUp types
- `e2e/arkanoid.spec.ts` - Added power-up tests

## Game Mechanics

### Multiple Balls
- Each power-up can trigger additional balls
- Extra balls have radius of 6 (vs main ball's 8)
- All balls must be lost to lose a life
- Main ball follows paddle until launched

### Ball Physics
- Main ball (isMain = true) follows paddle when not launched
- Secondary balls (isMain = false) are independent
- Each ball can be launched independently

### Score System
- Each brick destroyed: +10 points
- Power-ups don't add points directly
- More balls = more scoring opportunities

## Testing
All 8 Playwright E2E tests pass:
- Canvas display
- Game start
- Game elements rendering
- Pause/resume functionality
- Keyboard controls
- State persistence
- Multiple ball support
- Power-up system support
