#!/usr/bin/env sh
set -eu

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

if [ ! -f ".env" ]; then
  echo "Missing .env. Create it first:"
  echo "  cp .env.example .env"
  exit 1
fi

compose_files="-f docker-compose.yml"
if grep -E '^[[:space:]]*CLOUDFLARED_TOKEN=' .env >/dev/null 2>&1 && ! grep -E '^[[:space:]]*CLOUDFLARED_TOKEN=[[:space:]]*$' .env >/dev/null 2>&1; then
  compose_files="-f docker-compose.yml -f docker-compose.tunnel.yml"
fi

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  docker compose $compose_files up -d --build
elif command -v docker-compose >/dev/null 2>&1; then
  docker-compose $compose_files up -d --build
else
  echo "Docker Compose not found (need: docker compose OR docker-compose)."
  exit 1
fi

echo "Up. Check: curl -fsS http://127.0.0.1:49193/healthz"
