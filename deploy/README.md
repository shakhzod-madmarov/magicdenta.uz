# Magic Denta — Production Deployment Guide

Guide to deploying **Magic Denta** (`magicdenta.uz`, `admin-magicdenta.uz`, `api.magicdenta.uz`).

## 1. Nginx Setup
```bash
sudo cp deploy/nginx/magicdenta.conf /etc/nginx/sites-available/magicdenta.conf
sudo ln -s /etc/nginx/sites-available/magicdenta.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 2. Systemd Service Setup
```bash
sudo cp deploy/systemd/magicdenta-backend.service /etc/systemd/system/magicdenta-backend.service
sudo systemctl daemon-reload
sudo systemctl enable --now magicdenta-backend.service
```

## 3. SSL Setup (Certbot)
```bash
sudo certbot --nginx -d magicdenta.uz -d www.magicdenta.uz -d admin-magicdenta.uz -d admin.magicdenta.uz -d api.magicdenta.uz
```
