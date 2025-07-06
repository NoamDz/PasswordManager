#!/usr/bin/env bash
set -euo pipefail

# Root of repo
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$DIR"

# Install root dev deps (Playwright) if node_modules absent
if [ ! -d "node_modules" ]; then
  echo "Installing root dev dependencies (Playwright)..."
  npm install --silent
  npx playwright install --with-deps
fi

# Ensure frontend deps installed
if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm --prefix frontend install --silent
fi

# Run the e2e tests
npx playwright test