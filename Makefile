# Makefile for eval-hub.github.io documentation

.PHONY: help install serve build deploy clean diagrams

# Default target
help:
	@echo "Available targets:"
	@echo "  install    - Install documentation dependencies"
	@echo "  serve      - Start local development server"
	@echo "  build      - Build documentation site"
	@echo "  deploy     - Deploy to GitHub Pages"
	@echo "  clean      - Remove built documentation"
	@echo "  diagrams   - Generate all diagrams from D2 sources"

# Install dependencies
install:
	@echo "📦 Installing documentation dependencies..."
	pip install -r requirements.txt

# Serve documentation locally
serve:
	@echo "🚀 Starting documentation server..."
	@echo "📖 Documentation will be available at http://0.0.0.0:8000"
	mkdocs serve --dev-addr 0.0.0.0:8000

# Build documentation
build:
	@echo "🔨 Building documentation..."
	mkdocs build

# Deploy to GitHub Pages
deploy:
	@echo "🚀 Deploying to GitHub Pages..."
	mkdocs gh-deploy --force

# Clean built documentation
clean:
	@echo "🧹 Cleaning built documentation..."
	rm -rf site/

# Generate all diagrams from D2 sources (requires d2: https://d2lang.com/)
diagrams:
	@echo "📐 Generating diagrams from D2 sources..."
	@mkdir -p docs/images/diagrams
	@for f in diagrams/*.d2; do \
		name=$$(basename "$$f" .d2); \
		echo "  $$name.svg"; \
		d2 -l elk --pad 50 "$$f" "docs/images/diagrams/$$name.svg"; \
	done
	@echo "✅ All diagrams generated in docs/images/diagrams/"

# Build and serve
preview: build serve
