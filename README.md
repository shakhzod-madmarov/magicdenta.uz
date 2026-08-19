# Magic Denta (`magicdenta.uz`)

Modern, full-stack clinic management and patient booking platform for **Magic Denta** stomatology clinic. Specializing in Dental Orthopedics.

---

## 🏛️ Project Architecture

The system consists of three independent sub-projects:

1. **`front-denta/`** (Patient Portal & Public Website)
   - Domain: `https://magicdenta.uz`
   - Technology: React 19, Vite, Tailwind CSS
   - Features: Online doctor appointment booking, patient cabinet, treatment history, multilingual support (UZ, RU, EN), real-time queue screen (`/queue-display`), modern luxury design with `#92003A`, `#403D88`, `#0F3040`, `#321E48`, `#91008D`, `#FAF8FB` palette.

2. **`admin/`** (Clinic Management & Dentist Portal)
   - Domain: `https://admin-magicdenta.uz` / `https://admin.magicdenta.uz`
   - Technology: React 19, Vite, Tailwind CSS
   - Features: Real-time appointments, doctor schedules & working hours, payroll & commission calculations, treatment invoicing & receipt generation, expense & warehouse inventory tracking, patient records with dual password security, Telegram bot connect QR codes.

3. **`backend-denta/`** (REST API & Automated Jobs)
   - Domain: `https://api.magicdenta.uz`
   - Technology: Node.js, Express, MongoDB (Mongoose), JWT, Multer/Sharp, Nodemailer, Telegram Bot API
   - Features: Secure appointment locking, background reminder crons (1 day before, 3 hours before), orthodontist queue service with live distance calculation, automated walk-in expiration, automated activity audit logging, XML sitemap generator.

4. **`deploy/`** & **`scripts/`**
   - Nginx server configuration with upstream proxying and SSL setup (`magicdenta.conf`)
   - Systemd background service unit (`magicdenta-backend.service`)
   - Automated CD scripts and GitHub Actions workflows

---

## 🎨 Brand & Color Palette

- **Primary Wine / Deep Crimson**: `#92003A` (Primary CTA buttons, brand badges)
- **Royal Iris / Purple**: `#403D88` (Secondary accents, gradient harmony)
- **Midnight Navy / Deep Petrol**: `#0F3040` (Dark contrast, Hero background)
- **Deep Plum / Dark Violet**: `#321E48` (Dark surface, luxury cards)
- **Bright Orchid / Magenta**: `#91008D` (Highlight accents, sparkles, status highlights)
- **Clean Surface / Light Off-White**: `#FAF8FB` (Base background)

---

## 🚀 Local Development Setup

### 1. Backend API
```bash
cd backend-denta
npm install
npm run server  # Starts Express server on http://localhost:5000
```

### 2. Patient Frontend
```bash
cd front-denta
npm install
npm run dev     # Starts Vite dev server on http://localhost:5173
```

### 3. Admin & Dentist Portal
```bash
cd admin
npm install
npm run dev     # Starts Vite dev server on http://localhost:5174
```

---

## 🌐 Production Deployment

See detailed instructions in [`deploy/README.md`](deploy/README.md).

```bash
# Setup Nginx
sudo cp deploy/nginx/magicdenta.conf /etc/nginx/sites-available/magicdenta.conf
sudo ln -s /etc/nginx/sites-available/magicdenta.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Setup Systemd Service
sudo cp deploy/systemd/magicdenta-backend.service /etc/systemd/system/magicdenta-backend.service
sudo systemctl daemon-reload
sudo systemctl enable --now magicdenta-backend.service
```
