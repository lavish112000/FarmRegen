# FarmRegen Backend

Production-ready backend for FarmRegen soil health monitoring platform.

## Deployment

### Render

1. Connect GitHub repository
2. Set root directory to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables (see .env.example)

### Environment Variables Required

- DATABASE_URL
- JWT_SECRET
- GOOGLE_SERVICE_ACCOUNT_EMAIL
- GOOGLE_PRIVATE_KEY
- FRONTEND_URL
- NODE_ENV=production

## Local Development

```bash
npm install
npm run dev
```

## Health Check

GET /health
