# Arkanoid Brick Breaker - Generated Assets

This folder contains generated game assets. The game currently uses programmatic rendering via HTML5 Canvas API.

## Current Implementation

All graphics are rendered programmatically:
- **Paddle**: Green rectangle with glow effect (#00ff88)
- **Ball**: Red circle with shadow (#ff4444)
- **Bricks**: Color-coded rectangles in 5 rows
  - Row 1: Red (#ff0044)
  - Row 2: Orange (#ff6600)
  - Row 3: Yellow (#ffcc00)
  - Row 4: Green (#00cc66)
  - Row 5: Blue (#0066ff)
- **Background**: Dark blue (#1a1a2e)

## Adding Sprite Assets

To use image sprites instead of programmatic rendering:

1. Add your image files to this folder (PNG, SVG, or JPG)
2. Update the entity classes in `src/entities/` to load and draw images:

```typescript
// Example: Load paddle sprite
const paddleImage = new Image();
paddleImage.src = '/assets/sprites/paddle.png';

// In draw method:
ctx.drawImage(paddleImage, this.x, this.y, this.width, this.height);
```

## Recommended Asset Structure

```
assets/
├── sprites/
│   ├── paddle.png
│   ├── ball.png
│   ├── brick-red.png
│   ├── brick-orange.png
│   ├── brick-yellow.png
│   ├── brick-green.png
│   └── brick-blue.png
├── images/
│   ├── background.png
│   └── powerups/
└── audio/
    ├── bounce.mp3
    ├── brick.mp3
    └── music.mp3
```

## Next Steps

1. Create sprite sheets for better performance
2. Add particle effects for brick collisions
3. Implement power-up sprites
4. Add sound effects using Web Audio API
