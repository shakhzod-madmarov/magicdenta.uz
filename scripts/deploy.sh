#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRANCH="${MAGIC_DEPLOY_BRANCH:-main}"
PM2_APP_NAME="${MAGIC_PM2_APP_NAME:-magicdenta-backend}"

cd "$ROOT"

echo "[deploy] repo=$ROOT branch=$BRANCH"

git checkout -- frontend/public/sitemap.xml || true

if [[ -n "$(git status --porcelain)" ]]; then
  echo "[deploy] ERROR: working tree is dirty; commit/stash changes first" >&2
  git status --porcelain >&2 || true
  exit 1
fi

git fetch --prune origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

build_vite_app() {
  local dir="$1"

  if [[ -z "${VITE_BACKEND_URL:-}" && ! -f "$dir/.env" ]]; then
    echo "[deploy] WARNING: $dir missing VITE_BACKEND_URL (.env or env var)." >&2
  fi

  echo "[deploy] build $dir"
  pushd "$dir" >/dev/null
  npm ci
  npm run build
  popd >/dev/null
}

echo "[deploy] install backend"
pushd backend >/dev/null
npm ci
popd >/dev/null

build_vite_app frontend
build_vite_app admin

echo "[deploy] restart backend"
if command -v systemctl >/dev/null 2>&1 && systemctl is-active --quiet magicdenta-backend.service; then
  sudo systemctl restart magicdenta-backend.service
elif command -v pm2 >/dev/null 2>&1; then
  pm2 restart "$PM2_APP_NAME" || pm2 start server.js --name "$PM2_APP_NAME"
  pm2 save || true
else
  echo "[deploy] Warning: neither systemctl nor pm2 matched, check service status" >&2
fi

echo "[deploy] health check"
sleep 5
curl -fsS "http://127.0.0.1:5000/api/health" >/dev/null

echo "[deploy] Magic Denta deploy completed successfully!"
