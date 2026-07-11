#!/usr/bin/env bash
set -euo pipefail

: "${DEPLOY_HOST:?DEPLOY_HOST is required}"
: "${DEPLOY_PORT:?DEPLOY_PORT is required}"
: "${DEPLOY_USER:?DEPLOY_USER is required}"
: "${DEPLOY_SSH_KEY:?DEPLOY_SSH_KEY is required}"
: "${DEPLOY_KNOWN_HOSTS:?DEPLOY_KNOWN_HOSTS is required}"

install -d -m 700 ~/.ssh
printf '%s\n' "$DEPLOY_SSH_KEY" > ~/.ssh/onefile-deploy
chmod 600 ~/.ssh/onefile-deploy
printf '%s\n' "$DEPLOY_KNOWN_HOSTS" > ~/.ssh/known_hosts
chmod 600 ~/.ssh/known_hosts
cat > ~/.ssh/config <<EOF
Host onefile-deploy
  HostName $DEPLOY_HOST
  User $DEPLOY_USER
  Port $DEPLOY_PORT
  IdentityFile ~/.ssh/onefile-deploy
  IdentitiesOnly yes
  StrictHostKeyChecking yes
  UserKnownHostsFile ~/.ssh/known_hosts
  ConnectTimeout 15
  ServerAliveInterval 15
  ServerAliveCountMax 3
EOF
chmod 600 ~/.ssh/config
