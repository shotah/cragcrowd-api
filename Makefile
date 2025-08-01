# CragCrowd API Makefile

.PHONY: setup install build dev start test lint clean docker-build docker-run docker-stop

# Default target
all: setup build

# Setup development environment
setup:
	@echo "Setting up CragCrowd API development environment..."
	@cp .env.example .env || echo ".env file already exists"
	@mkdir -p logs
	$(MAKE) install

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install

# Build the application
build:
	@echo "Building application..."
	npm run build

# Start development server
dev:
	@echo "Starting development server..."
	npm run dev

# Start production server
start: build
	@echo "Starting production server..."
	npm start

# Run tests
test:
	@echo "Running tests..."
	npm test

# Run tests in watch mode
test-watch:
	@echo "Running tests in watch mode..."
	npm run test:watch

# Lint code
lint:
	@echo "Linting code..."
	npm run lint

# Fix linting issues
lint-fix:
	@echo "Fixing linting issues..."
	npm run lint:fix

# Type check
typecheck:
	@echo "Type checking..."
	npm run typecheck

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist
	rm -rf node_modules
	rm -rf logs/*.log

# Docker commands
docker-build:
	@echo "Building Docker image..."
	docker build -t cragcrowd-api .

docker-run:
	@echo "Running Docker container..."
	docker run -d --name cragcrowd-api -p 3000:3000 --env-file .env cragcrowd-api

docker-stop:
	@echo "Stopping Docker container..."
	docker stop cragcrowd-api || true
	docker rm cragcrowd-api || true

# Database commands
db-seed:
	@echo "Seeding database with sample data..."
	# Add database seeding script here

# Help
help:
	@echo "Available commands:"
	@echo "  setup         - Setup development environment"
	@echo "  install       - Install dependencies"
	@echo "  build         - Build application"
	@echo "  dev           - Start development server"
	@echo "  start         - Start production server"
	@echo "  test          - Run tests"
	@echo "  test-watch    - Run tests in watch mode"
	@echo "  lint          - Lint code"
	@echo "  lint-fix      - Fix linting issues"
	@echo "  typecheck     - Type check code"
	@echo "  clean         - Clean build artifacts"
	@echo "  docker-build  - Build Docker image"
	@echo "  docker-run    - Run Docker container"
	@echo "  docker-stop   - Stop Docker container"