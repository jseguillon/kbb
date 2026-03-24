.PHONY: build run clean help k8s k8s-build k8s-apply k8s-delete k8s-status ghcr-build ghcr-push ghcr

# Docker image names
FRONTEND_IMAGE?=vibes5-frontend:latest
MIDDLEWARE_IMAGE?=vibes5-k8s-middleware:latest

# GitHub Container Registry settings
GITHUB_USER?=$(shell echo $${GITHUB_USER:-$(USER)})
GHCR_REGISTRY?=ghcr.io
GHCR_FRONTEND_IMAGE=$(GHCR_REGISTRY)/$(GITHUB_USER)/arkanoid-frontend:latest
GHCR_MIDDLEWARE_IMAGE=$(GHCR_REGISTRY)/$(GITHUB_USER)/k8s-middleware:latest

build:
	@echo "Building frontend..."
	docker build -f Dockerfile.front -t $(FRONTEND_IMAGE) .
	@echo "Building k8s-middleware..."
	docker build -f Dockerfile.backend -t $(MIDDLEWARE_IMAGE) .
	@echo "Build complete!"

run:
	@echo "Starting frontend..."
	docker run -d -p 4173:80 --name vibes5-frontend $(FRONTEND_IMAGE)
	@echo "Starting k8s-middleware..."
	@echo "Note: Requires KUBECONFIG env or mounted kubeconfig"
	docker run -d \
		-p 3001:3001 \
		--name vibes5-k8s-middleware \
		-e KUBECONFIG=/root/.kube/config \
		-v ~/.kube/config:/root/.kube/config:ro \
		$(MIDDLEWARE_IMAGE)
	@echo "Services started!"
	@echo "Frontend: http://localhost:4173"
	@echo "k8s-middleware: http://localhost:3001"

stop:
	docker stop vibes5-frontend vibes5-k8s-middleware || true
	docker rm vibes5-frontend vibes5-k8s-middleware || true

clean: stop
	docker rmi $(FRONTEND_IMAGE) $(MIDDLEWARE_IMAGE) || true
	@echo "Cleaned up all images and containers!"

logs:
	docker logs -f vibes5-k8s-middleware

# Kubernetes deployment targets
k8s: k8s-build k8s-apply
	@echo "Kubernetes deployment complete!"

k8s-build:
	@echo "Building Kubernetes images..."
	docker build -f Dockerfile.front -t $(FRONTEND_IMAGE) .
	docker build -f Dockerfile.backend -t $(MIDDLEWARE_IMAGE) .
	@echo "Images built!"

k8s-apply:
	@echo "Applying Kubernetes manifests..."
	kubectl apply -f k8s/rbac.yaml
	kubectl apply -f k8s/middleware-deployment.yaml
	kubectl apply -f k8s/frontend-deployment.yaml
	@echo "Manifests applied!"

k8s-delete:
	@echo "Deleting Kubernetes resources..."
	kubectl delete -f k8s/frontend-deployment.yaml --ignore-not-found
	kubectl delete -f k8s/middleware-deployment.yaml --ignore-not-found
	kubectl delete -f k8s/rbac.yaml --ignore-not-found
	@echo "Resources deleted!"

k8s-status:
	@echo "=== Deployment Status ==="
	kubectl get deployments -n default
	kubectl get services -n default
	kubectl get pods -n default
	@echo "=== RBAC ==="
	kubectl get serviceaccounts | grep middleware
	kubectl get roles,rolebindings | grep middleware

# GitHub Container Registry targets
ghcr-build:
	@echo "Building images for ghcr.io..."
	docker build -f Dockerfile.front -t $(GHCR_FRONTEND_IMAGE) .
	docker build -f Dockerfile.backend -t $(GHCR_MIDDLEWARE_IMAGE) .
	@echo "Images built successfully!"

ghcr-push:
	@echo "Pushing images to ghcr.io..."
	docker push $(GHCR_FRONTEND_IMAGE)
	docker push $(GHCR_MIDDLEWARE_IMAGE)
	@echo "Images pushed successfully!"

ghcr: ghcr-build ghcr-push
	@echo "Full ghcr.io deployment complete!"

help:
	@echo "Available targets:"
	@echo "  make build       - Build Docker images (local)"
	@echo "  make run         - Start services locally"
	@echo "  make stop        - Stop services"
	@echo "  make clean       - Remove images and containers"
	@echo "  make k8s         - Build and deploy to Kubernetes"
	@echo "  make ghcr-build  - Build images for ghcr.io"
	@echo "  make ghcr-push   - Push images to ghcr.io"
	@echo "  make ghcr        - Build and push to ghcr.io"
	@echo "  make k8s-build   - Build Kubernetes images"
	@echo "  make k8s-apply   - Apply Kubernetes manifests"
	@echo "  make k8s-delete  - Delete Kubernetes resources"
	@echo "  make k8s-status  - Check Kubernetes deployment status"
