# Kubernetes Deployment Guide

## Overview

This document describes the complete Kubernetes deployment for the KBB game with Kubernetes middleware integration.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                        │
│                                                              │
│  ┌────────────────────┐     ┌────────────────────┐          │
│  │   Ingress          │     │   RBAC             │          │
│  │   (KBB.local) │     │   (ServiceAccount) │          │
│  └──────────┬─────────┘     └────────────────────┘          │
│             │                                                 │
│  ┌──────────▼──────────────────────────────────┐            │
│  │         Frontend Deployment                  │            │
│  │  ┌──────────────────────────────────────┐   │            │
│  │  │  Caddy Server (Port 80)              │   │            │
│  │  │  - Static files from /app/dist       │   │            │
│  │  │  - Compression (gzip, br, zstd)      │   │            │
│  │  │  - Proxy to middleware /api/*        │   │            │
│  │  └──────────────────────────────────────┘   │            │
│  └────────────────────────────────────────────┘            │
│             │                                                 │
│  ┌──────────▼──────────────────────────────────┐            │
│  │         Middleware Deployment                │            │
│  │  ┌──────────────────────────────────────┐   │            │
│  │  │  Go Middleware (Port 3001)           │   │            │
│  │  │  - /status - Health & cluster info   │   │            │
│  │  │  - /api/v1/pod/terminate - Delete pod│   │            │
│  │  │  - RBAC: pods get/list/watch/delete  │   │            │
│  │  └──────────────────────────────────────┘   │            │
│  └────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Kubernetes cluster (minikube, k3s, EKS, GKE, etc.)
- kubectl configured to access your cluster
- Docker (for building images)
- Make (optional, for convenience commands)

## Deployment Steps

### 1. Build Docker Images

```bash
# Local development (no registry)
make build

# With custom registry
DOCKER_REGISTRY=myregistry.com/ make build
```

### 2. Apply Kubernetes Resources

```bash
# Apply RBAC (ServiceAccount, Role, RoleBinding)
make k8s-apply

# Or manually:
kubectl apply -f k8s/rbac.yaml
```

### 3. Deploy Applications

```bash
# Full deployment
make deploy

# Or step by step:
kubectl apply -f k8s/middleware-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

### 4. Setup Kubeconfig (Required for Middleware)

The middleware needs access to the Kubernetes API. You have two options:

#### Option A: Use ClusterRoleBinding (Recommended for production)

Create a ServiceAccount with cluster-wide permissions:

```yaml
# k8s/rbac-cluster.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: k8s-middleware-sa
  namespace: default
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: pod-manager-cluster-role
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: k8s-middleware-cluster-rolebinding
subjects:
- kind: ServiceAccount
  name: k8s-middleware-sa
  namespace: default
roleRef:
  kind: ClusterRole
  name: pod-manager-cluster-role
  apiGroup: rbac.authorization.k8s.io
```

Apply it:
```bash
kubectl apply -f k8s/rbac-cluster.yaml
```

Then update `k8s/middleware-deployment.yaml` to remove the kubeconfig volume mount.

#### Option B: Mount kubeconfig from Secret

```bash
# Create secret from your kubeconfig
kubectl create secret generic kubeconfig-secret \
  --from-file=config=~/.kube/config \
  -n default

# Update deployment to use secret instead of ConfigMap
```

### 5. Access the Application

#### Option A: Ingress (Production)

```bash
# Apply ingress
kubectl apply -f k8s/frontend-deployment.yaml

# Access at: http://KBB.local
# Add to /etc/hosts if needed:
# 127.0.0.1 KBB.local
```

#### Option B: Port Forward (Development)

```bash
# Frontend
make port-forward-frontend
# Access: http://localhost:8080

# Middleware (for testing)
make port-forward-middleware
# Access: http://localhost:3001/status
```

#### Option C: NodePort (Quick Access)

Edit `k8s/frontend-deployment.yaml`:
```yaml
spec:
  type: NodePort  # Change from ClusterIP
```

Then find the port:
```bash
kubectl get svc KBB-frontend -n default
```

## Verification

### Check Deployment Status

```bash
make status
```

Expected output:
```
=== Deployment Status ===
NAME                     READY   UP-TO-DATE   AVAILABLE   AGE
KBB-frontend        1/1     1            1           2m
k8s-middleware           1/1     1            1           2m

=== Services ===
NAME                     TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
KBB-frontend        ClusterIP   10.96.123.45     <none>        80/TCP     2m
k8s-middleware           ClusterIP   10.96.234.56     <none>        3001/TCP   2m
```

### Check Health Endpoints

```bash
# Middleware status
curl http://localhost:3001/status | jq

# Expected response:
# {
#   "middleware": "ok",
#   "k8s": "ok",
#   "message": "Connected to Kubernetes cluster",
#   "runningPods": 5
# }

# Frontend health
curl http://localhost:8080/health
# Expected: OK
```

### Check Logs

```bash
# Middleware logs
make logs-middleware

# Frontend logs
make logs-frontend
```

## Resource Management

### Delete All Resources

```bash
make k8s-delete
```

### Clean Docker Images

```bash
make clean
```

### Full Reset

```bash
make clean && make k8s-delete
```

## Environment Variables

### Middleware

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `KUBECONFIG` | /root/.kube/config | Path to kubeconfig |

### Frontend

No environment variables required (static build).

## Security Considerations

1. **RBAC**: The middleware has limited permissions (only pods in default namespace, excluding kube-system)

2. **Network Policy**: Consider adding NetworkPolicy to restrict access:
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: middleware-network-policy
   spec:
     podSelector:
       matchLabels:
         app: k8s-middleware
     policyTypes:
     - Ingress
     ingress:
     - from:
       - podSelector:
           matchLabels:
             app: KBB-frontend
       ports:
       - protocol: TCP
         port: 3001
   ```

3. **Secrets**: Store kubeconfig as Kubernetes Secret, not ConfigMap

4. **Image Pull Policy**: Set to `IfNotPresent` for production registries

## Troubleshooting

### Middleware can't connect to K8s API

```bash
# Check logs
kubectl logs -l app=k8s-middleware

# Verify RBAC
kubectl describe rolebinding k8s-middleware-rolebinding -n default

# Test kubeconfig
kubectl exec -it <middleware-pod> -- sh
cat /root/.kube/config
```

### Frontend returns 404

```bash
# Check if dist folder exists in container
kubectl exec -it <frontend-pod> -- ls /app/dist

# Rebuild with npm run build
```

### Ingress not working

```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Test DNS
ping KBB.local

# Check ingress resource
kubectl describe ingress KBB-frontend-ingress
```

## Scaling

### Horizontal Pod Autoscaler

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: KBB-frontend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: KBB-frontend
  minReplicas: 1
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 80
```

Apply:
```bash
kubectl apply -f k8s/hpa.yaml
```

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Kubernetes

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker images
      run: make build
    
    - name: Login to Container Registry
      run: echo ${{ secrets.REGISTRY_PASSWORD }} | docker login ${{ secrets.REGISTRY_URL }} -u ${{ secrets.REGISTRY_USER }} --password-stdin
    
    - name: Tag and push images
      run: make image-tag
    
    - name: Deploy to Kubernetes
      run: make deploy
      env:
        KUBECONFIG: ${{ secrets.KUBECONFIG }}
```

## Next Steps

1. **Add Persistent Volume**: For storing game state/scores
2. **Implement Redis**: For high scores and session management
3. **Add Monitoring**: Prometheus + Grafana for metrics
4. **Setup Logging**: ELK stack or Loki for log aggregation
5. **Add PodDisruptionBudget**: Ensure high availability during upgrades
6. **Implement ResourceQuota**: Limit namespace resource consumption
