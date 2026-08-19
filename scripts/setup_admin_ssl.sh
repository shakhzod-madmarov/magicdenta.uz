#!/usr/bin/env bash
set -euo pipefail

DOMAIN="admin-magicdenta.uz"
EMAIL="admin@magicdenta.uz"

echo "[ssl] Requesting Let's Encrypt certificate for $DOMAIN"
sudo certbot --nginx -d "$DOMAIN" -d "admin.magicdenta.uz" --non-interactive --agree-tos -m "$EMAIL" --redirect
sudo nginx -t && sudo systemctl reload nginx
echo "[ssl] SSL configured successfully for $DOMAIN"
