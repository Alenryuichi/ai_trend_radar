.PHONY: install dev build preview clean help

# Default target
.DEFAULT_GOAL := help

## install: Install dependencies
install:
	npm install

## dev: Start development server (port 3000)
dev:
	npm run dev

## build: Build for production
build:
	npm run build

## preview: Preview production build
preview:
	npm run preview

## clean: Remove node_modules and dist
clean:
	rm -rf node_modules dist

## setup: First-time setup (install deps + create .env.local template)
setup: install
	@if [ ! -f .env.local ]; then \
		echo "GEMINI_API_KEY=your-api-key-here" > .env.local; \
		echo "✅ Created .env.local - please add your Gemini API key"; \
	else \
		echo "ℹ️  .env.local already exists"; \
	fi

## help: Show this help message
help:
	@echo ""
	@echo "🚀 AI TrendRadar - Available Commands:"
	@echo ""
	@grep -E '^##' Makefile | sed 's/## /  make /' | sed 's/: /\t→ /'
	@echo ""

