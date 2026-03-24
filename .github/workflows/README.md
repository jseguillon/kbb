# GitHub Actions Workflows

This directory contains GitHub Actions workflows for building and deploying the Arkanoid game.

## Available Workflows

### 1. Build and Push to ghcr.io

**File**: `docker-publish.yml`

**Triggers**:
- Push to `main` or `develop` branches
- Push of version tags (`v*`)
- Pull requests to `main` or `develop`

**Actions**:
- Builds frontend and middleware Docker images
- Pushes to GitHub Container Registry (ghcr.io)
- Tags images by branch, PR, semver, and commit SHA
- Only pushes on non-PR events (builds PR images but doesn't push)

**Image Tags**:
```
ghcr.io/owner/repo/frontend:main
ghcr.io/owner/repo/frontend:sha-abc123
ghcr.io/owner/repo/frontend:v1.0.0
ghcr.io/owner/repo/middleware:main
ghcr.io/owner/repo/middleware:sha-abc123
ghcr.io/owner/repo/middleware:v1.0.0
```

### 2. Deploy to Kubernetes

**File**: `deploy.yml`

**Triggers**:
- Completion of `docker-publish.yml` workflow on main branch
- Manual dispatch (workflow_dispatch)

**Actions**:
- Deploys images from ghcr.io to Kubernetes
- Supports multiple environments (development, staging, production)
- Performs health checks and rollout verification

## Setup Required Secrets

In your GitHub repository settings, add the following secrets:

### `KUBECONFIG`
Your Kubernetes cluster's kubeconfig file (base64 encoded).

```bash
# Generate kubeconfig
kubectl config view --minify -o json | base64 -w 0

# Add to GitHub secrets
# Settings > Secrets and variables > Actions > New repository secret
# Name: KUBECONFIG
# Value: <base64-encoded-kubeconfig>
```

### Optional: `GITHUB_USER`
If you want to customize the GitHub username for ghcr.io (defaults to workflow actor).

## Usage

### Automatic Deployment (on main branch push)

1. Push code to `main` branch
2. `docker-publish.yml` builds and pushes images
3. `deploy.yml` automatically triggers and deploys to Kubernetes

### Manual Deployment

```bash
# In GitHub repository > Actions > Deploy to Kubernetes > Run workflow

# Select parameters:
# Environment: development | staging | production
# Namespace: default (or custom)
# Frontend Tag: (optional, defaults to branch/tag)
# Middleware Tag: (optional, defaults to frontend tag)
```

### Local Build and Push to ghcr.io

```bash
# Set your GitHub username
export GITHUB_USER=your-username

# Build and push to ghcr.io
make ghcr

# Or manually
docker login ghcr.io -u your-username -p $GITHUB_TOKEN
docker build -f Dockerfile.front -t ghcr.io/your-username/arkanoid-frontend:latest .
docker build -f Dockerfile.backend -t ghcr.io/your-username/k8s-middleware:latest .
docker push ghcr.io/your-username/arkanoid-frontend:latest
docker push ghcr.io/your-username/k8s-middleware:latest
```

### Deploy from ghcr.io to Kubernetes

```bash
# Set image tags manually
export FRONTEND_TAG=main
export MIDDLEWARE_TAG=main

# Update deployment
kubectl set image deployment/arkanoid-frontend frontend=ghcr.io/your-username/arkanoid-frontend:${FRONTEND_TAG} -n default
kubectl set image deployment/k8s-middleware middleware=ghcr.io/your-username/k8s-middleware:${MIDDLEWARE_TAG} -n default
```

## Image Tagging Strategy

### Branch Tags
- `main` → `ghcr.io/owner/repo/frontend:main`
- `develop` → `ghcr.io/owner/repo/frontend:develop`

### Tag Tags (Semver)
- `v1.0.0` → `ghcr.io/owner/repo/frontend:v1.0.0`
- `v1.0.0` → `ghcr.io/owner/repo/frontend:v1`
- `v1.0.0` → `ghcr.io/owner/repo/frontend:v1.0`

### Commit SHA
- All pushes → `ghcr.io/owner/repo/frontend:sha-abc123def`

### PR Tags
- PR #123 → `ghcr.io/owner/repo/frontend:pr-123` (built but not pushed)

## Workflow Permissions

The workflows use minimal required permissions:

```yaml
permissions:
  contents: read      # Read repository contents
  packages: write    # Write to Container Registry
```

## Troubleshooting

### "Permission denied" when pushing to ghcr.io

Make sure to use `GITHUB_TOKEN` automatically provided by GitHub Actions:

```yaml
- name: Log in to Container Registry
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

### Kubeconfig authentication errors

Ensure the kubeconfig is properly base64 encoded:

```bash
# Verify encoding
echo "<base64-value>" | base64 -d | head -5

# Should show: apiVersion, kind, clusters, etc.
```

### Deployment fails to pull images

Check image exists in ghcr.io:
```bash
# List your repository's packages
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/orgs/OWNER/packages/container

# Or check via GitHub UI:
# github.com/OWNER/packages?tab=packages
```

## CI/CD Best Practices

1. **Test before deploying**: Use pull request workflow to build without pushing
2. **Tag releases**: Use semantic versioning for production releases
3. **Environment separation**: Use different namespaces for dev/staging/prod
4. **Rollback support**: Keep previous images tagged for quick rollback
5. **Health checks**: Workflows verify pod readiness before completing

## Rollback Example

```bash
# Find previous tag
kubectl rollout history deployment/arkanoid-frontend -n default

# Rollback to previous version
kubectl rollout undo deployment/arkanoid-frontend -n default

# Or rollback to specific tag
kubectl set image deployment/arkanoid-frontend frontend=ghcr.io/owner/repo/frontend:v0.9.0 -n default
```
