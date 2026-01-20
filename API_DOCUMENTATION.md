# FarmRegen API Documentation

## Base URL

- **Production**: `https://farmregen.onrender.com/api`
- **Development**: `http://localhost:5000/api`

## Authentication

All protected endpoints require an access token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Field Management Endpoints](#field-management-endpoints)
3. [Analysis Endpoints](#analysis-endpoints)
4. [Export Endpoints](#export-endpoints)
5. [Report Endpoints](#report-endpoints)
6. [User Profile Endpoints](#user-profile-endpoints)
7. [Error Responses](#error-responses)
8. [Rate Limiting](#rate-limiting)

---

## 🔐 Authentication Endpoints

### POST /auth/signup

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

**Validation Rules:**

- `full_name`: 2-100 characters, required
- `email`: Valid email format, required, unique
- `phone`: 10 digits, optional
- `password`: Minimum 8 characters, must contain uppercase, lowercase, and number

**Success Response (201):**

```json
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "token": "<access_token>",
  "refreshToken": "<refresh_token>",
  "expiresIn": 900
}
```

**Error Responses:**

```json
// 400 - Validation Error
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }
  ]
}

// 409 - Email Already Exists
{
  "message": "Email already registered"
}
```

---

### POST /auth/login

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**

```json
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "token": "<access_token>",
  "refreshToken": "<refresh_token>",
  "expiresIn": 900
}
```

**Error Responses:**

```json
// 401 - Invalid Credentials
{
  "message": "Invalid email or password"
}

// 429 - Rate Limit Exceeded
{
  "message": "Too many login attempts, please try again later"
}
```

---

### POST /auth/refresh

Rotate access and refresh tokens.

**Request Body:**

```json
{
  "refreshToken": "<refresh_token>"
}
```

**Success Response (200):**

```json
{
  "accessToken": "<new_access_token>",
  "refreshToken": "<new_refresh_token>",
  "expiresIn": 900
}
```

**Error Responses:**

```json
// 401 - Invalid or Expired Refresh Token
{
  "message": "Invalid refresh token"
}
```

---

## 👤 User Profile Endpoints

### GET /auth/me

Get current user profile (requires authentication).

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "created_at": "2026-01-19T10:00:00.000Z",
  "updated_at": "2026-01-19T10:00:00.000Z"
}
```

**Error Responses:**

```json
// 401 - Unauthorized
{
  "message": "No token provided"
}

// 401 - Invalid Token
{
  "message": "Invalid token"
}
```

---

### PUT /auth/profile

Update user profile (requires authentication).

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "full_name": "John Updated Doe",
  "phone": "9876543210"
}
```

**Validation Rules:**

- `full_name`: 2-100 characters, optional
- `phone`: 10 digits, optional

**Success Response (200):**

```json
{
  "id": 1,
  "full_name": "John Updated Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "updated_at": "2026-01-19T11:00:00.000Z"
}
```

---

### PUT /auth/password

Change user password (requires authentication).

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

**Success Response (200):**

```json
{
  "message": "Password updated successfully"
}
```

---

## 🗺️ Field Management Endpoints

### GET /fields

Get all fields for authenticated user.

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "North Field",
    "boundary": {
      "type": "Polygon",
      "coordinates": [
        [
          [78.9629, 20.5937],
          [78.9730, 20.5937],
          [78.9730, 20.6037],
          [78.9629, 20.6037],
          [78.9629, 20.5937]
        ]
      ]
    },
    "hectares": 5.2,
    "address": "Village Road, District",
    "soil_health_score": 75,
    "last_analysis_date": "2026-01-19T15:00:00.000Z",
    "created_at": "2026-01-19T10:30:00.000Z",
    "updated_at": "2026-01-19T15:00:00.000Z"
  },
  {
    "id": 2,
    "user_id": 1,
    "name": "South Field",
    "boundary": {
      "type": "Polygon",
      "coordinates": [[...]]
    },
    "hectares": 3.8,
    "address": "",
    "soil_health_score": null,
    "last_analysis_date": null,
    "created_at": "2026-01-19T12:00:00.000Z",
    "updated_at": "2026-01-19T12:00:00.000Z"
  }
]
```

**Notes:**

- `soil_health_score`: `null` if field has never been analyzed
- `last_analysis_date`: `null` if field has never been analyzed
- `boundary`: GeoJSON Geometry object (Polygon or MultiPolygon)

---

### POST /fields

Create a new field.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "East Field",
  "geojson": {
    "type": "Polygon",
    "coordinates": [
      [
        [78.9629, 20.5937],
        [78.9730, 20.5937],
        [78.9730, 20.6037],
        [78.9629, 20.6037],
        [78.9629, 20.5937]
      ]
    ]
  },
  "address": "Optional address"
}
```

**Alternative GeoJSON Format (Feature):**

```json
{
  "name": "East Field",
  "geojson": {
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [[...]]
    },
    "properties": {}
  },
  "address": "Optional address"
}
```

**Validation Rules:**

- `name`: 2-100 characters, required
- `geojson`: Valid GeoJSON Polygon or MultiPolygon, required
- `hectares`: 0.01-10000, optional (defaults to 0 if not provided)
- `address`: Max 500 characters, optional

**Success Response (201):**

```json
{
  "id": 3,
  "user_id": 1,
  "name": "East Field",
  "boundary": {
    "type": "Polygon",
    "coordinates": [[...]]
  },
  "hectares": 0,
  "address": "Optional address",
  "created_at": "2026-01-19T16:00:00.000Z",
  "updated_at": "2026-01-19T16:00:00.000Z"
}
```

**Error Responses:**

```json
// 400 - Invalid GeoJSON
{
  "message": "Invalid GeoJSON: Must be a Polygon or MultiPolygon"
}

// 400 - Validation Error
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "\"name\" is required"
    }
  ]
}
```

---

### DELETE /fields/:id

Delete a specific field.

**Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id`: Field ID (integer)

**Success Response (200):**

```json
{
  "message": "Field deleted"
}
```

**Error Responses:**

```json
// 404 - Field Not Found or Unauthorized
{
  "message": "Field not found or not authorized"
}
```

---

## 🛰️ Analysis Endpoints

### POST /analysis/:fieldId

Analyze soil health for a specific field using satellite imagery.

**Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `fieldId`: Field ID (integer)

**Request Body:** None required

**Processing:**

1. Retrieves field boundary from database
2. Queries Google Earth Engine for Sentinel-2 imagery (last 30 days)
3. Calculates NDVI, NDMI, EVI, SAVI (with mean + variability)
4. Computes overall soil health score (0-100)
5. Determines moisture status
6. Stores analysis and indices data in database

**Success Response (200):**

```json
{
  "id": 5,
  "field_id": 1,
  "analysis_date": "2026-01-19T16:30:00.000Z",
  "ndvi_mean": 0.65,
  "ndvi_stddev": 0.04,
  "ndmi_mean": 0.22,
  "evi_mean": 0.48,
  "savi_mean": 0.52,
  "soil_score": 75,
  "moisture_status": "Adequate",
  "satellite_image_url": "data:image/png;base64,...",
  "indices_data": {
    "ndvi": { "mean": 0.65, "min": 0.12, "max": 0.82, "stdDev": 0.04 },
    "ndmi": { "mean": 0.22, "min": -0.05, "max": 0.41, "stdDev": 0.06, "status": "Adequate" },
    "evi": { "mean": 0.48, "min": 0.10, "max": 0.70, "stdDev": 0.05 },
    "savi": { "mean": 0.52, "min": 0.14, "max": 0.75, "stdDev": 0.05 }
  },
  "indices": { "...": "same as indices_data" },
  "grade": "A",
  "created_at": "2026-01-19T16:30:00.000Z"
}
```

**Response Fields:**

- `ndvi_mean`, `ndvi_stddev`: NDVI mean and variability
- `ndmi_mean`: Moisture index mean
- `evi_mean`: Enhanced Vegetation Index mean
- `savi_mean`: Soil Adjusted Vegetation Index mean
- `soil_score`: Overall health score (0-100)
- `moisture_status`: NDMI-based moisture class
- `indices_data`: Full index statistics payload

**Error Responses:**

```json
// 404 - Field Not Found
{
  "message": "Field not found or not authorized"
}

// 500 - Earth Engine Error
{
  "message": "Failed to analyze field",
  "error": "No clear satellite imagery available for the specified period"
}
```

---

### GET /analysis/history

Get analysis history for all fields owned by the user.

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
[
  {
    "id": 5,
    "field_id": 1,
    "field_name": "North Field",
    "analysis_date": "2026-01-19T16:30:00.000Z",
    "ndvi_mean": 0.65,
    "ndvi_stddev": 0.04,
    "ndmi_mean": 0.22,
    "evi_mean": 0.48,
    "savi_mean": 0.52,
    "soil_score": 75,
    "moisture_status": "Adequate",
    "created_at": "2026-01-19T16:30:00.000Z"
  },
  {
    "id": 3,
    "field_id": 1,
    "field_name": "North Field",
    "analysis_date": "2026-01-10T10:00:00.000Z",
    "ndvi_mean": 0.58,
    "ndvi_stddev": 0.05,
    "ndmi_mean": 0.18,
    "evi_mean": 0.42,
    "savi_mean": 0.46,
    "soil_score": 68,
    "moisture_status": "Moderate",
    "created_at": "2026-01-10T10:00:00.000Z"
  }
]
```

**Notes:**

- Results ordered by `analysis_date` descending (most recent first)
- Empty array `[]` if no analyses exist

---

## 📦 Export Endpoints

All export endpoints require authentication.

### GET /export/csv

Export all analysis data as CSV.

**Query Params (optional):**

- `fieldId`: Filter by field ID

### GET /export/excel

Export all analysis data as Excel (XLSX).

**Query Params (optional):**

- `fieldId`: Filter by field ID

### GET /export/field/:fieldId

Export a single field’s analysis history.

**Query Params:**

- `format`: `csv` or `xlsx` (default: `csv`)

---

## 📄 Report Endpoints

### GET /reports/:analysisId/download

Download the advanced PDF report for a specific analysis.

**Response:** PDF file stream

---

## ⚠️ Error Responses

### Standard Error Format

All errors follow this format:

```json
{
  "message": "Human-readable error message",
  "errors": [  // Optional, for validation errors
    {
      "field": "field_name",
      "message": "Specific field error"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation error, malformed request |
| 401 | Unauthorized | Missing/invalid token, wrong credentials |
| 404 | Not Found | Resource doesn't exist or unauthorized |
| 409 | Conflict | Duplicate resource (e.g., email exists) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error, database error, external API error |

---

## 🚦 Rate Limiting

### Authentication Endpoints

- **Limit**: 5 requests per 15 minutes per IP (production)
- **Applies to**: `/auth/signup`, `/auth/login`
- **Purpose**: Prevent brute-force attacks

**Rate Limit Response (429):**

```json
{
  "message": "Too many login attempts, please try again later"
}
```

### Refresh Token Endpoint

- **Limit**: 30 requests per 15 minutes per IP (production)
- **Applies to**: `/auth/refresh`

### General API Endpoints

- **Limit**: 100 requests per 15 minutes per IP
- **Applies to**: All other endpoints
- **Purpose**: Prevent DoS attacks

**Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1706545200
```

### Analysis Endpoints

- **Limit**: 10 requests per hour per IP
- **Applies to**: `/analysis/:fieldId`

---

## 📝 Request Examples

### Using cURL

**Signup:**

```bash
curl -X POST https://farmregen.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "password": "SecurePass123"
  }'
```

**Login:**

```bash
curl -X POST https://farmregen.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Get Fields:**

```bash
curl -X GET https://farmregen.onrender.com/api/fields \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Create Field:**

```bash
curl -X POST https://farmregen.onrender.com/api/fields \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Field",
    "geojson": {
      "type": "Polygon",
      "coordinates": [[[78.9629, 20.5937], [78.9730, 20.5937], [78.9730, 20.6037], [78.9629, 20.6037], [78.9629, 20.5937]]]
    }
  }'
```

**Analyze Field:**

```bash
curl -X POST https://farmregen.onrender.com/api/analysis/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Refresh Token:**

```bash
curl -X POST https://farmregen.onrender.com/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Export CSV:**

```bash
curl -X GET https://farmregen.onrender.com/api/export/csv \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://farmregen.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Signup
const signup = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

// Login
const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('refreshToken', response.data.refreshToken);
  return response.data;
};

// Refresh token
const refresh = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await api.post('/auth/refresh', { refreshToken });
  localStorage.setItem('token', response.data.accessToken);
  localStorage.setItem('refreshToken', response.data.refreshToken);
  return response.data;
};

// Get Fields
const getFields = async () => {
  const response = await api.get('/fields');
  return response.data;
};

// Create Field
const createField = async (fieldData) => {
  const response = await api.post('/fields', fieldData);
  return response.data;
};

// Analyze Field
const analyzeField = async (fieldId) => {
  const response = await api.post(`/analysis/${fieldId}`);
  return response.data;
};
```

---

## 🔒 Security Best Practices

### For API Consumers

1. **Store Tokens Securely**:
   - Use `httpOnly` cookies for web apps
   - Use secure storage for mobile apps
   - Never expose tokens in URLs

2. **Handle Token Expiration**:
  - Access tokens expire after 15 minutes
  - Refresh tokens expire after 7 days
  - Implement automatic refresh flow
   - Clear tokens on logout

3. **Validate Input Client-Side**:
   - Reduce unnecessary API calls
   - Provide better UX with instant feedback
   - Still rely on server-side validation

4. **Use HTTPS Only**:
   - Never send requests over HTTP
   - Verify SSL certificates

5. **Implement Rate Limit Handling**:
   - Detect 429 responses
   - Implement exponential backoff
   - Show user-friendly messages

---

## 📞 Support

For API issues or questions:

- **Email**: <lalitchoudhary112000@gmail.com>
- **GitHub Issues**: <https://github.com/lavish112000/FarmRegen/issues>

---

**Last Updated**: January 2026  
**API Version**: 1.0.0
