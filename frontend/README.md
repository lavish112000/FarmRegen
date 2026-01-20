# FarmRegen Frontend

React + Vite frontend for the FarmRegen soil health platform.

## ✨ Features

- Marketing landing page
- Login/signup with refresh-token session management
- Field mapping (Leaflet + drawing tools)
- Analysis modal with NDVI, NDMI, EVI, SAVI detail views
- Reports page with CSV/Excel exports and PDF download
- Dark mode theme support

## 🚀 Local Development

```bash
npm install
npm run dev
```

## 🔧 Environment Variables

Create a .env file (or set in Vercel):

```env
VITE_API_URL=http://localhost:5000/api
```

## 📦 Build

```bash
npm run build
npm run preview
```
