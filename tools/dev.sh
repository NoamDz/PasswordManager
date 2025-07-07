#!/usr/bin/env bash
set -e

# start postgres in detached mode
printf "Starting Postgres container...\n"
docker compose -f docker-compose.dev.yml up -d db

cleanup() {
  echo "Stopping backend/frontend and Postgres..."
  docker compose -f docker-compose.dev.yml stop db
}
trap cleanup INT TERM

# start backend
python -m uvicorn backend.app.main:app --reload --port 8000 &
BACK_PID=$!

# start frontend
npm --prefix frontend run dev &
FRONT_PID=$!

wait $BACK_PID $FRONT_PID
cleanup 