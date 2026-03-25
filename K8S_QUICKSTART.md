# Quick Start: Deploy to Kubernetes

## 1. Build Images

```bash
make build
```

## 2. Deploy to Kubernetes

```bash
make k8s
```

This will:
- Build Docker images
- Apply RBAC (ServiceAccount, Role, RoleBinding)
- Deploy middleware and frontend
- Create services and ingress

## 3. Access the Game

```bash
# Option A: Port forward (development)
kubectl port-forward svc/KBB-frontend 8080:80 -n default
# Visit: http://localhost:8080

# Option B: Check ingress (production)
# Add to /etc/hosts: 127.0.0.1 KBB.local
# Visit: http://KBB.local
```

## 4. Verify Deployment

```bash
make k8s-status
```

## 5. Check Middleware Status

```bash
curl http://localhost:3001/status
```

Expected output:
```json
{
  "middleware": "ok",
  "k8s": "ok",
  "message": "Connected to Kubernetes cluster",
  "runningPods": 5
}
```

## Common Commands

```bash
# View logs
kubectl logs -l app=k8s-middleware -n default
kubectl logs -l app=KBB-frontend -n default

# Delete deployment
make k8s-delete

# Restart
make k8s-delete && make k8s
```

## Important Notes

1. **Kubeconfig Required**: The middleware needs access to your Kubernetes cluster
   - For minikube/k3s: `eval $(minikube env)` or use local kubeconfig
   - For cloud clusters: Ensure kubectl is configured

2. **RBAC Permissions**: The middleware can only delete pods in the `default` namespace
   - Excludes `kube-system` namespace for safety

3. **Ingress**: By default uses host `KBB.local`
   - Add to `/etc/hosts`: `127.0.0.1 KBB.local`
   - Or update ingress host in `k8s/frontend-deployment.yaml`

## Troubleshooting

### "Error: connection refused" on /status
```bash
# Check if middleware is running
kubectl get pods -l app=k8s-middleware

# Check logs
kubectl logs -l app=k8s-middleware
```

### "Error: failed to list pods"
```bash
# Verify RBAC
kubectl describe rolebinding k8s-middleware-rolebinding

# Check ServiceAccount
kubectl describe serviceaccount k8s-middleware-sa
```

### Frontend 404
```bash
# Rebuild with npm run build
npm run build
make build
kubectl rollout restart deployment/KBB-frontend
```

## Next Steps

See [k8s/DEPLOYMENT.md](k8s/DEPLOYMENT.md) for:
- Production deployment guide
- Security considerations
- Scaling strategies
- CI/CD integration
- Monitoring setup
