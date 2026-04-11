# Makefile for eval-hub.github.io documentation

.PHONY: help install serve build deploy clean diagrams

# Default target
help:
	@echo "Available targets:"
	@echo "  install    - Install documentation dependencies"
	@echo "  serve      - Start local development server"
	@echo "  build      - Build documentation site"
	@echo "  clean      - Remove built documentation"
	@echo "  diagrams   - Generate all diagrams from D2 sources"

# Install dependencies
install:
	@echo "Installing documentation dependencies..."
	npm install

# Serve documentation locally
serve:
	@echo "Starting documentation server..."
	npm run dev

# Build documentation
build:
	@echo "Building documentation..."
	npm run build

# Clean built documentation
clean:
	@echo "Cleaning built documentation..."
	rm -rf dist/ .astro/

# Generate all diagrams from D2 sources (requires d2: https://d2lang.com/)
diagrams:
	@echo "Generating diagrams from D2 sources..."
	@mkdir -p public/images/diagrams
	@for f in diagrams/*.d2; do \
		name=$$(basename "$$f" .d2); \
		echo "  $$name.svg"; \
		d2 -l elk --pad 50 "$$f" "public/images/diagrams/$$name.svg"; \
	done
	@echo "All diagrams generated in public/images/diagrams/"

# Build and serve
preview: build
	npm run preview
