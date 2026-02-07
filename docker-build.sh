#!/usr/bin/env bash
# Build frontend image with BuildKit; pass Firebase secrets via env to avoid image layer leaks.
# Required env: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN
# Optional env: VITE_API_BASE_URL, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET,
#   VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID, VITE_FIREBASE_MEASUREMENT_ID,
#   VITE_USE_FIREBASE_EMULATOR (default: false)
set -e
SCRIPT_DIR="$(dirname "$0")"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
export DOCKER_BUILDKIT=1
docker build \
  --secret id=firebase_api_key,env=VITE_FIREBASE_API_KEY \
  --secret id=firebase_auth_domain,env=VITE_FIREBASE_AUTH_DOMAIN \
  --build-arg VITE_API_BASE_URL="${VITE_API_BASE_URL:-}" \
  --build-arg VITE_FIREBASE_PROJECT_ID="${VITE_FIREBASE_PROJECT_ID:-}" \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET="${VITE_FIREBASE_STORAGE_BUCKET:-}" \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID="${VITE_FIREBASE_MESSAGING_SENDER_ID:-}" \
  --build-arg VITE_FIREBASE_APP_ID="${VITE_FIREBASE_APP_ID:-}" \
  --build-arg VITE_FIREBASE_MEASUREMENT_ID="${VITE_FIREBASE_MEASUREMENT_ID:-}" \
  --build-arg VITE_USE_FIREBASE_EMULATOR="${VITE_USE_FIREBASE_EMULATOR:-false}" \
  -f "$SCRIPT_DIR/Dockerfile" \
  -t visa-vibe-frontend \
  "$SCRIPT_DIR"
