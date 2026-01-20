# FarmRegen Backend

Production backend for FarmRegen’s soil health monitoring platform.

## ✨ Features

- JWT auth with access + refresh tokens
- Google Earth Engine analysis with NDVI, NDMI, EVI, SAVI
- PDF report generation (multi-page)
- CSV/Excel exports for analysis history
- Rate limiting + validation + centralized error handling

## 🚀 Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

## 🗄️ Database Setup

Run the base schema, then apply the vegetation indices migration:

```bash
psql $DATABASE_URL < schema.sql
psql $DATABASE_URL < src/db/migrations/001_add_vegetation_indices.sql
```

## 🌍 Environment Variables

Required:

- DATABASE_URL
- JWT_SECRET
- GOOGLE_SERVICE_ACCOUNT_EMAIL
- GOOGLE_PRIVATE_KEY
- FRONTEND_URL
- NODE_ENV
- PORT (optional, defaults to 5000)

## 📡 Key Endpoints

- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/refresh
- GET /api/analysis/history
- GET /api/export/csv
- GET /api/export/excel
- GET /api/reports/:analysisId/download

Full reference: [API_DOCUMENTATION.md](../API_DOCUMENTATION.md)

## ✅ Health Check

- GET /health

## 🌐 Deployment (Render)

1. Connect GitHub repository
2. Set root directory to backend
3. Build command: npm install
4. Start command: npm start
5. Add environment variables (see .env.example)
