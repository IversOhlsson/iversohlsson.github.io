#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Starting dev server..."
echo "Open the URL printed below in your browser."
npm run dev -- --host 0.0.0.0
