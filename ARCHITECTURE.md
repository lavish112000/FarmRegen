# FarmRegen Architecture Documentation

## 🏗️ System Architecture Overview

### High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER LAYER                                │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Browser   │  │   Mobile    │  │   Tablet    │             │
│  │   (Chrome)  │  │   (Safari)  │  │   (Edge)    │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                 │                 │                     │
│         └─────────────────┴─────────────────┘                     │
│                           │                                       │
└───────────────────────────┼───────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                               │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Vercel CDN (Global Edge Network)              │  │
│  │                                                            │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │           React 19 Single Page Application           │ │  │
│  │  │                                                      │ │  │
│  │  │  Components:                                         │ │  │
│  │  │  • Landing Page                                      │ │  │
│  │  │  • Authentication (Login/Signup)                     │ │  │
│  │  │  • Dashboard (Field Management)                      │ │  │
│  │  │  • Interactive Map (Leaflet + Drawing Tools)         │ │  │
│  │  │  • Analysis Results (Multi-Index Modal)              │ │  │
│  │  │  • Reports & Exports                                 │ │  │
│  │  │  • User Settings / Learning                          │ │  │
│  │  │                                                      │ │  │
│  │  │  State Management: Zustand + React Hooks            │ │  │
│  │  │  Styling: Tailwind CSS + Framer Motion              │ │  │
│  │  │  Build: Vite (Rolldown) - Code Splitting            │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬──────────────────────────────────┘
                                │ REST API (JSON)
                                │ JWT Authentication
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                                │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Render (Node.js Server)                       │  │
│  │                                                            │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │            Express.js Application                    │ │  │
│  │  │                                                      │ │  │
│  │  │  Middleware Stack:                                   │ │  │
│  │  │  1. Helmet (Security Headers)                        │ │  │
│  │  │  2. CORS (Cross-Origin)                              │ │  │
│  │  │  3. Morgan (HTTP Logging)                            │ │  │
│  │  │  4. Rate Limiter (DoS Protection)                    │ │  │
│  │  │  5. Body Parser (JSON)                               │ │  │
│  │  │  6. JWT Auth (Protected Routes)                      │ │  │
│  │  │  7. Joi Validator (Input Validation)                 │ │  │
│  │  │                                                      │ │  │
│  │  │  Route Handlers:                                     │ │  │
│  │  │  • /auth/* - Authentication                          │ │  │
│  │  │  • /fields/* - Field Management                      │ │  │
│  │  │  • /analysis/* - Soil Analysis                       │ │  │
│  │  │  • /reports/* - PDF Reports                           │ │  │
│  │  │  • /export/* - CSV/Excel Export                        │ │  │
│  │  │                                                      │ │  │
│  │  │  Services:                                           │ │  │
│  │  │  • Earth Engine Service (NDVI/NDMI/EVI/SAVI)         │ │  │
│  │  │  • Report Service (PDFKit)                           │ │  │
│  │  │  • Export Service (CSV/XLSX)                          │ │  │
│  │  │  • Logger Service (Winston)                          │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────┬─────────────────────────────────┬─────────────────────┘
           │                                 │
           │ PostgreSQL Protocol (SSL)       │ HTTPS API
           │                                 │
           ▼                                 ▼
┌─────────────────────────┐    ┌──────────────────────────────────┐
│    DATA LAYER           │    │   EXTERNAL SERVICES              │
│                         │    │                                  │
│  ┌───────────────────┐  │    │  ┌────────────────────────────┐ │
│  │  Neon PostgreSQL  │  │    │  │  Google Earth Engine API   │ │
│  │  (Serverless)     │  │    │  │                            │ │
│  │                   │  │    │  │  • Sentinel-2 Imagery      │ │
│  │  Extensions:      │  │    │  │  • NDVI/NDMI/EVI/SAVI       │ │
│  │  • PostGIS        │  │    │  │  • Moisture Status          │ │
│  │                   │  │    │  │  • Satellite Visuals        │ │
│  │  Tables:          │  │    │  └────────────────────────────┘ │
│  │  • users          │  │    │                                  │
│  │  • fields         │  │    └──────────────────────────────────┘
│  │  • field_analyses │  │
│  │                   │  │
│  │  Indexes:         │  │
│  │  • GIST (spatial) │  │
│  │  • B-tree (PK/FK) │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

---

## 🔄 Request Flow

### 1. User Authentication Flow

```
User Browser
    │
    │ 1. POST /api/auth/signup
    │    { email, password, full_name, phone }
    ▼
Vercel CDN
    │
    │ 2. Forward to Backend
    ▼
Render Server
    │
    ├─→ Rate Limiter (100 req/15min)
    │
    ├─→ Joi Validator
    │   • Email format
    │   • Password strength
    │   • Name length
    │
    ├─→ Auth Controller
    │   • Check email uniqueness
    │   • Hash password (bcrypt, 10 rounds)
    │   • Insert user into DB
    │   • Generate access token (15m) + refresh token (7d)
    │
    ▼
Neon Database
    │
    │ INSERT INTO users (...)
    │ RETURNING id, email, full_name
    ▼
Response
    │
    │ 201 Created
    │ { token: "...", refreshToken: "...", expiresIn: 900 }
    ▼
User Browser
    │
    │ Store token + refreshToken in localStorage
    │ Redirect to /dashboard
```

### 2. Field Creation Flow

```
User Browser
    │
    │ 1. Draw polygon on map (Leaflet)
    │    Extract GeoJSON geometry
    │
    │ 2. POST /api/fields
    │    Authorization: Bearer <token>
    │    { name, geojson, address }
    ▼
Vercel CDN
    │
    │ 3. Forward to Backend
    ▼
Render Server
    │
    ├─→ JWT Middleware
    │   • Verify token signature
    │   • Check expiration
    │   • Extract user ID
    │
    ├─→ Joi Validator
    │   • Name: 2-100 chars
    │   • GeoJSON: object
    │   • Address: optional
    │
    ├─→ Field Controller
    │   • Handle Feature vs Geometry
    │   • Validate Polygon/MultiPolygon
    │   • Default hectares to 0
    │
    ▼
Neon Database
    │
    │ INSERT INTO fields (
    │   user_id,
    │   name,
    │   boundary,  -- PostGIS Geometry
    │   hectares,
    │   address
    │ )
    │
    │ PostGIS Function:
    │ ST_SetSRID(ST_GeomFromGeoJSON($3), 4326)
    ▼
Response
    │
    │ 201 Created
    │ { id, name, boundary, ... }
    ▼
User Browser
    │
    │ Add field to local state
    │ Display on map
    │ Show in field list
```

### 3. Soil Analysis Flow

```
User Browser
    │
    │ 1. Click "Analyze" button
    │    POST /api/analysis/:fieldId
    │    Authorization: Bearer <token>
    ▼
Render Server
    │
    ├─→ JWT Middleware
    │
    ├─→ Analysis Controller
    │   • Fetch field from DB
    │   • Verify ownership
    │   • Extract coordinates
    │
    ▼
Google Earth Engine
    │
    │ 2. Authenticate with Service Account
    │
    │ 3. Query Sentinel-2 Collection
    │    • Filter by bounds (field polygon)
    │    • Filter by date (last 30 days)
    │    • Filter by cloud cover (<20%)
    │
    │ 4. Calculate Metrics
    │    • NDVI = (B8 - B4) / (B8 + B4)
    │    • Soil Moisture (B11/B8 ratio)
    │    • Organic Matter (B2/B4 ratio)
    │
    │ 5. Reduce to Mean
    │    • Spatial reducer over polygon
    │    • Scale: 10m resolution
    │
    ▼
Render Server
    │
    │ 6. Calculate Soil Health Score
    │    score = (ndvi * 0.4) + 
    │            (moisture * 0.3) + 
    │            (organic * 0.3)
    │
    │ 7. Generate Recommendations
    │    • Based on score thresholds
    │    • Actionable farming advice
    │
    ▼
Neon Database
    │
    │ INSERT INTO field_analyses (
    │   field_id,
    │   ndvi,
    │   soil_moisture,
    │   organic_matter,
    │   soil_health_score,
    │   recommendations
    │ )
    │
    │ UPDATE fields
    │ SET soil_health_score = $1,
    │     last_analysis_date = NOW()
    ▼
Response
    │
    │ 200 OK
    │ {
    │   id, field_id, analysis_date,
    │   ndvi, soil_moisture, organic_matter,
    │   soil_health_score, recommendations
    │ }
    ▼
User Browser
    │
    │ Open Analysis Modal
    │ Display charts (Recharts)
    │ Show recommendations
    │ Update field health score
```

---

## 🗂️ Component Architecture

### Frontend Component Hierarchy

```
App.jsx (Root)
│
├─ Router (React Router DOM)
│  │
│  ├─ Landing.jsx
│  │  └─ Hero, Features, CTA
│  │
│  ├─ Login.jsx
│  │  └─ Input, Button
│  │
│  ├─ Signup.jsx
│  │  └─ Input, Button
│  │
│  ├─ Dashboard.jsx (Protected)
│  │  │
│  │  ├─ DashboardLayout
│  │  │  ├─ Header (Logo, User Menu)
│  │  │  ├─ Sidebar (Navigation)
│  │  │  └─ Main Content
│  │  │
│  │  ├─ Stats Cards (Framer Motion)
│  │  │  ├─ Total Fields
│  │  │  ├─ Monitor Area
│  │  │  ├─ Avg Health
│  │  │  └─ Next Scan
│  │  │
│  │  ├─ FieldMap
│  │  │  ├─ MapContainer (React-Leaflet)
│  │  │  ├─ TileLayer (OpenStreetMap)
│  │  │  ├─ DrawControl (Leaflet-Draw)
│  │  │  └─ GeoJSON (Existing Fields)
│  │  │
│  │  ├─ Field List
│  │  │  └─ Field Card (Map)
│  │  │     ├─ Name, Health Score
│  │  │     ├─ Analyze Button
│  │  │     └─ Delete Button
│  │  │
│  │  └─ AnalysisModal
│  │     ├─ NDVI Chart (Recharts)
│  │     ├─ Moisture Chart
│  │     ├─ Health Score Gauge
│  │     └─ Recommendations
│  │
│  ├─ MyFields.jsx (Protected)
│  │  └─ DashboardLayout
│  │     └─ Field Table
│  │
│  └─ Profile.jsx (Protected)
│     └─ DashboardLayout
│        └─ Profile Form
│
└─ ErrorBoundary
   └─ Fallback UI
```

### Backend Module Architecture

```
server.js (Entry Point)
│
├─ Middleware Stack
│  ├─ helmet()
│  ├─ cors()
│  ├─ morgan()
│  ├─ express.json()
│  └─ rateLimiter
│
├─ Routes
│  ├─ /auth
│  │  └─ authRoutes.js
│  │     ├─ POST /signup → authController.signup
│  │     ├─ POST /login → authController.login
│  │     ├─ GET /profile → auth → authController.getProfile
│  │     └─ PUT /profile → auth → authController.updateProfile
│  │
│  ├─ /fields
│  │  └─ fieldRoutes.js
│  │     ├─ GET / → auth → fieldController.getFields
│  │     ├─ POST / → auth → validate → fieldController.createField
│  │     └─ DELETE /:id → auth → fieldController.deleteField
│  │
│  └─ /analysis
│     └─ analysisRoutes.js
│        ├─ POST /:fieldId → auth → analysisController.analyzeField
│        └─ GET /history → auth → analysisController.getHistory
│
│  └─ /export
│     └─ exportRoutes.js
│        ├─ GET /csv → auth → exportController.exportCSV
│        ├─ GET /excel → auth → exportController.exportExcel
│        └─ GET /field/:fieldId → auth → exportController.exportFieldAnalysis
│
│  └─ /reports
│     └─ reportRoutes.js
│        └─ GET /:analysisId/download → auth → reportController.generateReport
│
├─ Controllers
│  ├─ authController.js
│  │  • Business logic for authentication
│  │  • Password hashing/verification
│  │  • Access + refresh token generation
│  │
│  ├─ fieldController.js
│  │  • Field CRUD operations
│  │  • GeoJSON validation
│  │  • Ownership verification
│  │
│  ├─ analysisController.js
│  │  • Earth Engine integration
│  │  • Multi-index calculation
│  │  • Score + grade computation
│  │
│  ├─ exportController.js
│  │  • CSV/XLSX export
│  │  • Field-specific exports
│  │
│  └─ reportController.js
│     • Multi-page PDF reports
│     • Historical trend summary
│
├─ Models (Data Access Layer)
│  ├─ userModel.js
│  │  • findByEmail()
│  │  • create()
│  │  • update()
│  │
│  ├─ fieldModel.js
│  │  • findByUserId()
│  │  • create()
│  │  • delete()
│  │
│  └─ analysisModel.js
│     • create()
│     • findByFieldId()
│
├─ Services
│  ├─ earthEngine.js
│  │  • EE authentication
│  │  • Image collection queries
│  │  • Metric calculations
│  │
│  └─ logger.js
│     • Winston configuration
│     • Log levels
│     • File/console transports
│
├─ Middleware
│  ├─ auth.js
│  │  • JWT verification
│  │  • User context injection
│  │
│  ├─ validator.js
│  │  • Joi schemas
│  │  • Validation middleware factory
│  │
│  └─ rateLimiter.js
│     • Rate limit configs
│     • IP-based tracking
│
└─ Config
   └─ db.js
      • PostgreSQL connection pool
      • SSL configuration
      • Query helper
```

---

## 🔒 Security Architecture

### Defense in Depth Strategy

```
Layer 1: Network Security
├─ HTTPS/TLS encryption
├─ Vercel/Render DDoS protection
└─ Firewall rules (Neon)

Layer 2: Application Security
├─ Helmet.js security headers
├─ CORS origin restriction
├─ Rate limiting (IP-based)
└─ Input sanitization

Layer 3: Authentication & Authorization
├─ JWT token-based auth
├─ bcrypt password hashing (10 rounds)
├─ Access tokens (15 min) + refresh tokens (7 days)
└─ Route-level protection

Layer 4: Data Security
├─ Parameterized SQL queries
├─ Joi input validation
├─ PostGIS type constraints
└─ Foreign key cascades

Layer 5: Monitoring & Logging
├─ Winston structured logging
├─ Error tracking
├─ Access logs (Morgan)
└─ Database query logs
```

---

## 📊 Data Flow Architecture

### Write Operations (Create Field)

```
Client                 Backend                Database
  │                      │                      │
  │  POST /fields        │                      │
  ├─────────────────────>│                      │
  │  { name, geojson }   │                      │
  │                      │                      │
  │                      │  Validate JWT        │
  │                      ├──────────────────────┤
  │                      │                      │
  │                      │  Validate Input      │
  │                      │  (Joi)               │
  │                      │                      │
  │                      │  Transform GeoJSON   │
  │                      │  Feature → Geometry  │
  │                      │                      │
  │                      │  INSERT INTO fields  │
  │                      ├─────────────────────>│
  │                      │  (user_id, name,     │
  │                      │   ST_GeomFromGeoJSON)│
  │                      │                      │
  │                      │  RETURNING *         │
  │                      │<─────────────────────┤
  │                      │                      │
  │  201 Created         │                      │
  │<─────────────────────┤                      │
  │  { id, name, ... }   │                      │
  │                      │                      │
```

### Read Operations (Get Fields)

```
Client                 Backend                Database
  │                      │                      │
  │  GET /fields         │                      │
  ├─────────────────────>│                      │
  │  Authorization: ...  │                      │
  │                      │                      │
  │                      │  Verify JWT          │
  │                      │  Extract user_id     │
  │                      │                      │
  │                      │  SELECT f.*,         │
  │                      │    (SELECT score     │
  │                      │     FROM analyses    │
  │                      │     ORDER BY date    │
  │                      │     LIMIT 1)         │
  │                      │  FROM fields f       │
  │                      │  WHERE user_id = $1  │
  │                      ├─────────────────────>│
  │                      │                      │
  │                      │  [field1, field2]    │
  │                      │<─────────────────────┤
  │                      │                      │
  │                      │  Transform           │
  │                      │  ST_AsGeoJSON()      │
  │                      │                      │
  │  200 OK              │                      │
  │<─────────────────────┤                      │
  │  [{ id, name, ... }] │                      │
  │                      │                      │
```

---

## 🚀 Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                     │
│                                                          │
│  Global Edge Network (CDN)                               │
│  ├─ US East (Primary)                                    │
│  ├─ US West                                              │
│  ├─ Europe                                               │
│  └─ Asia Pacific                                         │
│                                                          │
│  Features:                                               │
│  • Automatic HTTPS                                       │
│  • HTTP/2 & HTTP/3                                       │
│  • Brotli compression                                    │
│  • Image optimization                                    │
│  • Serverless functions (if needed)                      │
└─────────────────────────────────────────────────────────┘
                           │
                           │ API Calls
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    RENDER (Backend)                      │
│                                                          │
│  Region: US East (Ohio)                                  │
│                                                          │
│  Instance:                                               │
│  • Type: Free / Starter                                  │
│  • CPU: Shared                                           │
│  • RAM: 512MB                                            │
│  • Auto-scaling: Yes                                     │
│  • Health checks: /health endpoint                       │
│                                                          │
│  Features:                                               │
│  • Automatic deployments (GitHub)                        │
│  • Zero-downtime deploys                                 │
│  • Automatic HTTPS                                       │
│  • Environment variables                                 │
│  • Persistent disk (if needed)                           │
└─────────────────────────────────────────────────────────┘
                           │
                           │ PostgreSQL
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    NEON (Database)                       │
│                                                          │
│  Region: US East (Ohio) - Same as Render                 │
│                                                          │
│  Database:                                               │
│  • PostgreSQL 15                                         │
│  • PostGIS 3.x                                           │
│  • Storage: Serverless (auto-scaling)                    │
│  • Compute: 0.25 CU (scales to 1 CU)                     │
│                                                          │
│  Features:                                               │
│  • Connection pooling                                    │
│  • Automatic backups                                     │
│  • Point-in-time recovery                                │
│  • Database branching                                    │
│  • SSL/TLS encryption                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📈 Scalability Considerations

### Current Capacity

- **Frontend**: Unlimited (Vercel CDN)
- **Backend**: ~100 concurrent requests (Render Free)
- **Database**: ~100 connections (Neon Free)

### Scaling Strategy

#### Horizontal Scaling (Backend)

```
Load Balancer
    │
    ├─> Render Instance 1
    ├─> Render Instance 2
    └─> Render Instance 3
         │
         └─> Neon Database (Connection Pool)
```

#### Caching Layer

```
Client → CDN → Redis Cache → Backend → Database
                    │
                    └─> Cache Hit (Fast)
                    └─> Cache Miss (Slow, then cache)
```

#### Database Optimization

```
Read Replicas:
Primary (Write) → Replica 1 (Read)
                → Replica 2 (Read)
                → Replica 3 (Read)
```

---

**Last Updated**: January 2026  
**Version**: 1.0.0
