#!/usr/bin/env bash
set -euo pipefail

: "${SSH_HOST:?SSH_HOST is required}"
: "${REMOTE_DIR:?REMOTE_DIR is required}"
: "${ONEFILE_IMAGE:?ONEFILE_IMAGE is required}"
: "${COMPOSE_PROJECT_NAME:?COMPOSE_PROJECT_NAME is required}"
: "${COMPOSE_SERVICE_NAME:?COMPOSE_SERVICE_NAME is required}"
: "${USE_SUDO:?USE_SUDO is required}"
: "${LOG_TAIL:?LOG_TAIL is required}"

shell_quote() {
  printf '%q' "$1"
}

remote_dir=$(shell_quote "$REMOTE_DIR")
ssh "$SSH_HOST" "mkdir -p $remote_dir"
scp docker-compose.yml "$SSH_HOST:$REMOTE_DIR/docker-compose.yml"

ssh "$SSH_HOST" \
  "REMOTE_DIR=$(shell_quote "$REMOTE_DIR") \
  ONEFILE_IMAGE=$(shell_quote "$ONEFILE_IMAGE") \
  COMPOSE_PROJECT_NAME=$(shell_quote "$COMPOSE_PROJECT_NAME") \
  COMPOSE_SERVICE_NAME=$(shell_quote "$COMPOSE_SERVICE_NAME") \
  USE_SUDO=$(shell_quote "$USE_SUDO") \
  LOG_TAIL=$(shell_quote "$LOG_TAIL") \
  bash -s" <<'REMOTE_DEPLOY'
set -euo pipefail

cd "$REMOTE_DIR"
if [ ! -f .env ]; then
  echo "$REMOTE_DIR/.env is required" >&2
  exit 1
fi

docker_cmd=(docker)
if [ "$USE_SUDO" = "1" ]; then
  docker_cmd=(sudo -n docker)
fi

export ONEFILE_IMAGE
compose=(
  "${docker_cmd[@]}" compose
  --project-name "$COMPOSE_PROJECT_NAME"
  --env-file .env
  -f docker-compose.yml
)

"${compose[@]}" pull "$COMPOSE_SERVICE_NAME"
"${compose[@]}" up -d --remove-orphans "$COMPOSE_SERVICE_NAME"

container_id=$("${compose[@]}" ps -q "$COMPOSE_SERVICE_NAME")
if [ -z "$container_id" ]; then
  echo "Container for $COMPOSE_SERVICE_NAME was not created" >&2
  exit 1
fi

for attempt in $(seq 1 30); do
  status=$("${docker_cmd[@]}" inspect \
    --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' \
    "$container_id" 2>/dev/null || true)
  if [ "$status" = "healthy" ] || [ "$status" = "running" ]; then
    echo "Container $COMPOSE_SERVICE_NAME is $status"
    break
  fi
  if [ "$status" = "unhealthy" ] || [ "$status" = "exited" ] || [ "$status" = "dead" ]; then
    echo "Container $COMPOSE_SERVICE_NAME entered $status state" >&2
    "${compose[@]}" logs --tail "$LOG_TAIL" "$COMPOSE_SERVICE_NAME" || true
    exit 1
  fi
  if [ "$attempt" = "30" ]; then
    echo "Container $COMPOSE_SERVICE_NAME did not become healthy; last status: ${status:-unknown}" >&2
    "${compose[@]}" logs --tail "$LOG_TAIL" "$COMPOSE_SERVICE_NAME" || true
    exit 1
  fi
  sleep 5
done

"${compose[@]}" ps
"${compose[@]}" logs --tail "$LOG_TAIL" "$COMPOSE_SERVICE_NAME"
REMOTE_DEPLOY
