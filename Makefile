.PHONY: build run clean help

build:
	@echo "Building frontend..."
	docker build -f Dockerfile.front -t vibes5-frontend:latest .
	@echo "Building k8s-middleware..."
	docker build -f Dockerfile.backend -t vibes5-k8s-middleware:latest .
	@echo "Build complete!"

run:
	@echo "Starting frontend..."
	docker run -d -p 4173:4173 --name vibes5-frontend vibes5-frontend:latest
	@echo "Starting k8s-middleware..."
	@echo "Note: Requires KUBECONFIG env or mounted kubeconfig"
	docker run -d \
		-p 3001:3001 \
		--name vibes5-k8s-middleware \
		-e KUBECONFIG=/root/.kube/config \
		-v ~/.kube/config:/root/.kube/config:ro \
		vibes5-k8s-middleware:latest
	@echo "Services started!"
	@echo "Frontend: http://localhost:5173"
	@echo "k8s-middleware: http://localhost:3001"

stop:
	docker stop vibes5-frontend vibes5-k8s-middleware || true
	docker rm vibes5-frontend vibes5-k8s-middleware || true

clean: stop
	docker rmi vibes5-frontend:latest vibes5-k8s-middleware:latest || true
	@echo "Cleaned up all images and containers!"

logs:
	docker logs -f vibes5-k8s-middleware

help:
	@echo "Available targets:"
	@echo "  make build  - Build both frontend and k8s-middleware Docker images"
	@echo "  make run    - Start both services"
	@echo "  make stop   - Stop both services"
	@echo "  make clean  - Remove all images and containers"
	@echo "  make logs   - View logs from both services"
