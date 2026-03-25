#!/bin/bash

echo "=== Kubernetes kbb Test Runner ==="
echo ""
echo "Prerequisites:"
echo "1. Start Go middleware: cd k8s-middleware && ./k8s-middleware"
echo "2. Start dev server: npm run dev"
echo ""
echo "Running Playwright tests..."
echo ""

cd /home/jse/vibes5

# Run only Kubernetes termination tests
./node_modules/.bin/playwright test k8s-termination.spec.ts --headed=false
