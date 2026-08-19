#!/usr/bin/env bash
set -euo pipefail

# Complete VPS Setup for Magic Denta (magicdenta.uz)
APP_DIR="/var/www/magicdenta"
NGINX_CONF="/etc/nginx/sites-available/magicdenta.conf"
SERVICE_NAME="magicdenta-backend"

echo "[setup] Setting up directory: $APP_DIR"
sudo mkdir -p "$APP_DIR"
sudo chown -R $USER:$USER "$APP_DIR"

echo "[setup] Installing nginx config"
sudo cp deploy/nginx/magicdenta.conf "$NGINX_CONF"
sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "[setup] Installing systemd service"
sudo cp deploy/systemd/magicdenta-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now "$SERVICE_NAME"

echo "[setup] Magic Denta VPS setup completed successfully!"
