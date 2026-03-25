# Kubernetes KBB

KBB game that terminates Kubernetes pods when breaking red bricks.

## Architecture

```
[Browser Game] --HTTP--> [Go Middleware] --K8s API--> [Kubernetes Cluster]
```

## Setup

### 1. Start Go Middleware (Terminal 1)

```bash
cd /home/jse/vibes5/k8s-middleware
./k8s-middleware
```

The middleware listens on `http://localhost:3001`

### 2. Start KBB Game (Terminal 2)

```bash
cd /home/jse/vibes5
npm run dev
```

## How It Works

1. Play KBB normally
2. Break **red bricks** (`#ff0044`)
3. The Go middleware receives a DELETE request
4. Middleware queries K8s API for running pods (excluding `kube-system`)
5. A random pod is terminated
6. No visual feedback in the game - silent operation

## Middleware Details

- **Endpoint**: `DELETE /api/v1/pod/terminate`
- **Port**: 3001
- **Authentication**: Uses `$KUBECONFIG` or `~/.kube/config`
- **Excluded namespaces**: `kube-system` only
- **Pod selection**: Random from running pods

## Safety

- Middleware runs locally on your machine
- No authentication required (trust the local endpoint)
- Console logs show which pods are terminated
- Game continues normally after each termination
