#!/bin/sh
set -eu

PORT="${PORT:-49193}"

exec gunicorn \
  --workers 1 \
  --threads 8 \
  --timeout 90 \
  --bind "0.0.0.0:${PORT}" \
  "ai_chat_site.wsgi:app"

