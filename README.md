# FarmRegen - Regenerative Agriculture Intelligence Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

## 🌾 Overview

FarmRegen is a comprehensive soil health monitoring and regenerative agriculture platform that leverages satellite imagery, Google Earth Engine, and advanced analytics to help farmers optimize their agricultural practices. The platform provides real-time soil health analysis, field management, and actionable insights for sustainable farming.

## 🎯 Key Features

### 🗺️ Interactive Field Management

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for the complete, up-to-date API reference. Highlights include:

- Auth with access + refresh tokens
- Multi-index analysis (NDVI/NDMI/EVI/SAVI)
- CSV/Excel exports
- Advanced PDF reports
│   │   ├── config/
│   │   │   └── db.js                 # PostgreSQL connection pool
│   │   ├── controllers/
│   │   │   ├── authController.js     # Authentication logic
│   │   │   ├── fieldController.js    # Field CRUD operations
│   │   │   ├── exportController.js   # CSV/Excel exports
│   │   │   ├── reportController.js   # PDF report generation
│   │   │   └── analysisController.js # Soil analysis logic
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT verification
│   │   │   ├── errorHandler.js       # Centralized error handling
│   │   │   ├── validator.js          # Joi validation schemas
│   │   │   └── rateLimiter.js        # Rate limiting configs
│   │   ├── models/
│   │   │   ├── userModel.js          # User data access
│   │   │   ├── fieldModel.js         # Field data access
│   │   │   └── analysisModel.js      # Analysis data access
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /api/auth/* endpoints
│   │   │   ├── exportRoutes.js       # /api/export/* endpoints
│   │   │   ├── fieldRoutes.js        # /api/fields/* endpoints
│   │   │   ├── analysisRoutes.js     # /api/analysis/* endpoints
│   │   │   └── reportRoutes.js       # /api/reports/* endpoints
│   │   ├── services/
│   │   │   └── earthEngine.js        # Google Earth Engine integration
│   │   ├── utils/
│   │   │   └── logger.js             # Winston logger configuration
│   │   └── server.js                 # Express app entry point
│   ├── src/db/
│   │   ├── migrations/
│   │   │   └── 001_add_vegetation_indices.sql
│   │   └── schema.sql
│   ├── schema.sql                    # Database schema
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalysisModal.jsx     # Multi-index analysis modal
│   │   │   ├── Button.jsx            # Reusable button component
│   │   │   ├── Sidebar.jsx           # Dashboard navigation
│   │   │   ├── Input.jsx             # Reusable input component
│   │   │   ├── DashboardLayout.jsx   # Main layout wrapper
│   │   │   ├── FieldMap.jsx          # Leaflet map with drawing tools
│   │   │   └── ErrorBoundary.jsx     # Error handling wrapper
│   │   ├── pages/
│   │   │   ├── Landing.jsx           # Marketing landing page
│   │   │   ├── Login.jsx             # User login
│   │   │   ├── Signup.jsx            # User registration
│   │   │   ├── Dashboard.jsx         # Main dashboard
│   │   │   ├── MyFields.jsx          # Field list view
│   │   │   ├── Reports.jsx           # Analysis history + exports
│   │   │   ├── SoilAnalysis.jsx      # Field analysis view
│   │   │   ├── Settings.jsx          # User settings
│   │   │   └── Learn.jsx             # Education content
│   │   ├── routes/
│   │   │   ├── ProtectedRoute.jsx    # Authenticated routes
│   │   │   └── PublicOnlyRoute.jsx   # Public-only routes
│   │   ├── services/
│   │   │   └── api.js                # Axios instance with interceptors
│   │   ├── store/
│   │   │   ├── authStore.js          # Auth state + token refresh
│   │   │   └── themeStore.js         # Theme preferences
│   │   ├── App.jsx                   # Root component with routing
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Tailwind CSS imports
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js ≥18.0.0
- npm ≥9.0.0
- PostgreSQL database (or Neon account)
- Google Earth Engine service account

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/lavish112000/FarmRegen.git
cd FarmRegen
```

#### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
```

Configure your `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google Earth Engine
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://farm-regen.vercel.app
```

#### 3. Database Setup

```bash
# Run the schema.sql file in your PostgreSQL database
psql $DATABASE_URL < schema.sql

# Apply latest migration for vegetation indices
psql $DATABASE_URL < src/db/migrations/001_add_vegetation_indices.sql
```

#### 4. Frontend Setup

```bash
cd ../frontend
npm install

# Create .env file
cp .env.example .env
```

Configure your `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

### Running Locally

#### Backend

```bash
cd backend
npm run dev  # Development mode with nodemon
# or
npm start    # Production mode
```

#### Frontend

```bash
cd frontend
npm run dev  # Development server on http://localhost:5173
```

## 🌐 API Documentation

### Authentication Endpoints

#### POST /api/auth/signup

Register a new user account.

**Request Body:**

```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "SecurePass123"
}
```

**Response (201):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  }
}
```

#### POST /api/auth/login

Authenticate and receive JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Field Management Endpoints

#### GET /api/fields

Get all fields for authenticated user.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
[
  {
    "id": 1,
    "name": "North Field",
    "boundary": {
      "type": "Polygon",
      "coordinates": [[[lng, lat], [lng, lat], ...]]
    },
    "hectares": 5.2,
    "soil_health_score": 75,
    "created_at": "2026-01-19T10:30:00Z",
    "last_analysis_date": "2026-01-19T15:00:00Z"
  }
]
```

#### POST /api/fields

Create a new field.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "South Field",
  "geojson": {
    "type": "Polygon",
    "coordinates": [[[lng, lat], [lng, lat], ...]]
  },
  "address": "123 Farm Road"
}
```

**Response (201):**

```json
{
  "id": 2,
  "name": "South Field",
  "boundary": {...},
  "hectares": 0,
  "created_at": "2026-01-19T16:00:00Z"
}
```

#### DELETE /api/fields/:id

Delete a field.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "message": "Field deleted"
}
```

### Analysis Endpoints

#### POST /api/analysis/:fieldId

Analyze soil health for a specific field.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "id": 1,
  "field_id": 1,
  "analysis_date": "2026-01-19T16:30:00Z",
  "ndvi": 0.65,
  "soil_moisture": 0.42,
  "organic_matter": 3.2,
  "soil_health_score": 75,
  "recommendations": "Soil health is good. Consider cover cropping to maintain organic matter levels."
}
```

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Fields Table

```sql
CREATE TABLE fields (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    boundary GEOMETRY(Polygon, 4326) NOT NULL,
    hectares DECIMAL(10, 2) DEFAULT 0,
    address TEXT,
  soil_health_score INTEGER,
  last_analysis_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Field Analyses Table

```sql
CREATE TABLE field_analyses (
    id SERIAL PRIMARY KEY,
    field_id INTEGER REFERENCES fields(id) ON DELETE CASCADE,
  analysis_date DATE NOT NULL,
  ndvi_mean DECIMAL(5, 4),
  ndvi_stddev DECIMAL(5, 4),
  ndmi_mean DECIMAL(5, 4),
  evi_mean DECIMAL(5, 4),
  savi_mean DECIMAL(5, 4),
  soil_score INTEGER,
  moisture_status VARCHAR(50),
  satellite_image_url TEXT,
  indices_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 Security Features

### Authentication & Authorization

- **JWT Tokens**: Access tokens (15 min) + refresh tokens (7 days)
- **Password Hashing**: bcryptjs with salt rounds for secure password storage
- **Token Verification**: Middleware-based route protection

### Input Validation

- **Joi Schemas**: Comprehensive validation for all API inputs
- **Sanitization**: Automatic removal of unknown fields
- **Type Checking**: Strict type validation for all parameters

### Rate Limiting

- **Auth Endpoints**: 5 requests per 15 minutes (production)
- **Refresh Tokens**: 30 requests per 15 minutes (production)
- **General API**: 100 requests per 15 minutes
- **Analysis**: 10 requests per hour
- **IP-Based Tracking**: Per-IP rate limit enforcement

### HTTP Security

- **Helmet.js**: Security headers (XSS, CSP, HSTS, etc.)
- **CORS**: Configured for specific frontend origin
- **Trust Proxy**: Enabled for reverse proxy environments (Render)

### Database Security

- **Parameterized Queries**: Prevention of SQL injection
- **Connection Pooling**: Efficient and secure connection management
- **SSL Connections**: Encrypted database connections in production

## 📊 Performance Optimizations

### Frontend

- **Code Splitting**: Vite-based automatic code splitting
- **Lazy Loading**: React.lazy for route-based code splitting
- **Asset Optimization**: Automatic image and asset optimization
- **Caching**: Service worker caching for offline support

### Backend

- **Connection Pooling**: PostgreSQL connection pool for efficient DB access
- **Async/Await**: Non-blocking asynchronous operations
- **Logging**: Structured logging with Winston for debugging
- **Error Handling**: Centralized error handling middleware

## 🌍 Deployment

### Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render)

1. Connect GitHub repository to Render
2. Configure environment variables in Render dashboard
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Enable auto-deploy on push to main branch

### Database (Neon)

1. Create Neon project
2. Run schema.sql in Neon SQL Editor
3. Copy connection string to backend .env

## 🧪 Testing

### Manual Testing Scripts

```bash
# Check database users
node backend/check-users.js

# Check fields
NODE_ENV=production node backend/check-fields.js

# Test field creation
node backend/test-create-field.js

# Test login
node backend/test-login.js
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Errors

- Ensure `DATABASE_URL` includes `?sslmode=require` for Neon
- Verify SSL configuration in `db.js`
- Check connection pool settings

#### Google Earth Engine Errors

- Verify service account credentials
- Ensure private key is properly formatted with `\\n` for newlines
- Check Earth Engine API is enabled

#### Frontend Build Errors

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Vite configuration
- Verify environment variables are set

## 📝 License

ISC License - See LICENSE file for details

## 👥 Contributors

- Lalit Choudhary (@lavish112000)

## 🙏 Acknowledgments

- Google Earth Engine for satellite imagery
- Leaflet for mapping capabilities
- Neon for serverless PostgreSQL
- Vercel and Render for hosting

## 📧 Support

For issues and questions, please open an issue on GitHub or contact <lalitchoudhary112000@gmail.com>
