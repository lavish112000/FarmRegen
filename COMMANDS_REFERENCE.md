# FarmRegen - Complete Commands Reference

> **Purpose**: This document contains every command used in the FarmRegen project, organized by category with detailed explanations of what each command does, when to use it, and common troubleshooting tips.

---

## Table of Contents

1. [Project Setup Commands](#project-setup-commands)
2. [Development Commands](#development-commands)
3. [Database Commands](#database-commands)
4. [Testing Commands](#testing-commands)
5. [Deployment Commands](#deployment-commands)
6. [Git Commands](#git-commands)
7. [Debugging & Maintenance Commands](#debugging--maintenance-commands)
8. [Future Commands (Planned)](#future-commands-planned)

---

## Project Setup Commands

### Initial Project Setup

#### 1. Clone Repository

```bash
git clone https://github.com/yourusername/FarmRegen.git
cd FarmRegen
```

**Purpose**: Download the project from GitHub to your local machine  
**When to use**: First time setting up the project  
**Output**: Creates `FarmRegen/` directory with all project files

---

#### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

**Purpose**: Installs all Node.js packages listed in `package.json`  
**When to use**: After cloning, or when `package.json` changes  
**What it installs**:

- `express`: Web framework
- `pg`: PostgreSQL client
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT authentication
- `@google/earthengine`: Google Earth Engine SDK
- `joi`: Input validation
- `helmet`: Security headers
- `morgan`: HTTP logging
- `winston`: Application logging
- `pdfkit`: PDF generation
- `cors`: Cross-origin resource sharing

**Troubleshooting**:

- **Error: `EACCES` permission denied**: Run `sudo npm install` (Linux/Mac) or run terminal as Administrator (Windows)
- **Error: `node-gyp` build failed**: Install build tools:
  - Windows: `npm install --global windows-build-tools`
  - Mac: `xcode-select --install`
  - Linux: `sudo apt-get install build-essential`

---

#### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

**Purpose**: Installs React and related packages  
**When to use**: After cloning, or when `package.json` changes  
**What it installs**:

- `react` & `react-dom`: Core React library
- `react-router-dom`: Client-side routing
- `axios`: HTTP client for API calls
- `zustand`: State management
- `react-leaflet` & `leaflet`: Interactive maps
- `leaflet-draw`: Drawing tools for field boundaries
- `recharts`: Charts for analysis visualization

**Troubleshooting**:

- **Error: `peer dependency` warnings**: Safe to ignore (non-critical)
- **Error: `ERESOLVE` unable to resolve dependency tree**: Run `npm install --legacy-peer-deps`

---

#### 4. Setup Environment Variables

**Backend** (`backend/.env`):

```bash
# Create .env file
touch backend/.env

# Add required variables
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-key-min-32-characters
NODE_ENV=development
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----"
```

**Frontend** (`frontend/.env`):

```bash
# Create .env file
touch frontend/.env

# Add API URL
VITE_API_URL=http://localhost:5000
```

**Purpose**: Configure application settings without hardcoding secrets  
**When to use**: First setup, or when deploying to new environment  
**Security Note**: Never commit `.env` files to Git (already in `.gitignore`)

---

## Development Commands

### Backend Development

#### 5. Start Backend Development Server

```bash
cd backend
npm run dev
```

**Purpose**: Starts Express server with auto-reload (nodemon)  
**When to use**: During development  
**What it does**:

1. Runs `nodemon src/server.js`
2. Watches for file changes in `src/` directory
3. Auto-restarts server when files change
4. Connects to database on startup
5. Initializes Google Earth Engine

**Output**:

```
[nodemon] starting `node src/server.js`
info: Server running on port 5000
info: Connected to PostgreSQL database
info: GEE Service Ready
```

**Troubleshooting**:

- **Error: `EADDRINUSE` port 5000 already in use**:
  - Find process: `lsof -i :5000` (Mac/Linux) or `netstat -ano | findstr :5000` (Windows)
  - Kill process: `kill -9 <PID>` (Mac/Linux) or `taskkill /PID <PID> /F` (Windows)
  - Or change port in `.env`: `PORT=5001`

- **Error: `Database connection error`**:
  - Check `DATABASE_URL` in `.env`
  - Verify database is running: `psql $DATABASE_URL -c "SELECT 1"`
  - Check network connectivity to Neon

- **Error: `GEE Service Warning: Failed to initialize`**:
  - Verify `GOOGLE_PRIVATE_KEY` has escaped newlines (`\\n` not `\n`)
  - Check service account has Earth Engine API enabled
  - Ensure `service-account.json` exists (local fallback)

---

#### 6. Start Backend Production Server

```bash
cd backend
npm start
```

**Purpose**: Starts Express server without auto-reload  
**When to use**: Production deployment (Render, AWS, etc.)  
**Difference from `npm run dev`**:

- No nodemon (doesn't watch for changes)
- Runs `node src/server.js` directly
- Faster startup (no file watching overhead)

---

### Frontend Development

#### 7. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

**Purpose**: Starts Vite development server with HMR (Hot Module Replacement)  
**When to use**: During development  
**What it does**:

1. Runs `vite` command
2. Starts dev server on `http://localhost:5173`
3. Watches for file changes
4. Hot-reloads components without full page refresh

**Output**:

```
VITE v6.0.3  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
➜  press h + enter to show help
```

**Troubleshooting**:

- **Error: `Port 5173 is already in use`**:
  - Change port: `npm run dev -- --port 3000`
  - Or kill existing process

- **Error: `Failed to resolve import`**:
  - Clear node_modules: `rm -rf node_modules package-lock.json && npm install`
  - Check import paths (case-sensitive on Linux)

- **Blank page in browser**:
  - Check browser console for errors
  - Verify `VITE_API_URL` in `.env`
  - Check CORS settings in backend

---

#### 8. Build Frontend for Production

```bash
cd frontend
npm run build
```

**Purpose**: Creates optimized production build  
**When to use**: Before deploying to Vercel/Netlify  
**What it does**:

1. Runs `vite build`
2. Bundles all React components
3. Minifies JavaScript and CSS
4. Optimizes images
5. Generates `dist/` folder with static files

**Output**:

```
vite v6.0.3 building for production...
✓ 1234 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-abc123.css     12.34 kB │ gzip:  3.45 kB
dist/assets/index-def456.js     234.56 kB │ gzip: 78.90 kB
✓ built in 3.45s
```

**Troubleshooting**:

- **Error: `Build failed`**:
  - Check for TypeScript errors (if using TS)
  - Verify all imports are correct
  - Run `npm run dev` first to catch errors

- **Large bundle size (>500KB)**:
  - Analyze bundle: `npm run build -- --mode analyze`
  - Implement code splitting
  - Lazy load routes

---

#### 9. Preview Production Build Locally

```bash
cd frontend
npm run preview
```

**Purpose**: Serves production build locally for testing  
**When to use**: After `npm run build` to test production behavior  
**What it does**:

1. Serves files from `dist/` folder
2. Runs on `http://localhost:4173`
3. Simulates production environment

**Use case**: Test if production build works before deploying

---

## Database Commands

### PostgreSQL/Neon Commands

#### 10. Connect to Database (psql)

```bash
psql "postgresql://user:password@host:5432/database"
```

**Purpose**: Opens interactive PostgreSQL shell  
**When to use**: Manual database inspection, running SQL queries  
**Common commands inside psql**:

```sql
\dt                    -- List all tables
\d table_name          -- Describe table schema
\du                    -- List users
\l                     -- List databases
\q                     -- Quit psql
```

**Example session**:

```bash
$ psql $DATABASE_URL
psql (16.1)
Type "help" for help.

farmregen=> \dt
              List of relations
 Schema |      Name       | Type  |  Owner
--------+-----------------+-------+----------
 public | users           | table | postgres
 public | fields          | table | postgres
 public | field_analyses  | table | postgres

farmregen=> SELECT COUNT(*) FROM users;
 count
-------
    42
(1 row)

farmregen=> \q
```

---

#### 11. Run Database Schema

```bash
cd backend
psql $DATABASE_URL < src/db/schema.sql
```

**Purpose**: Creates all tables, indexes, and triggers  
**When to use**: Initial database setup, or resetting database  
**What it creates**:

- `users` table (id, email, password_hash, full_name, phone)
- `fields` table (id, user_id, name, boundary, hectares, soil_health_score)
- `field_analyses` table (id, field_id, analysis_date, ndvi_mean, soil_score, etc.)
- Indexes on foreign keys and geospatial columns
- Triggers for `updated_at` timestamps

**Warning**: This will **drop existing tables** if they exist (see `DROP TABLE IF EXISTS`)

---

#### 12. Run Database Migration

```bash
cd backend
node migrate.js
```

**Purpose**: Adds missing columns to existing database  
**When to use**: After pulling new code that requires schema changes  
**What it does**:

1. Connects to Neon database
2. Runs `ALTER TABLE` statements with `IF NOT EXISTS`
3. Adds columns: `ndvi_stddev`, `ndmi_mean`, `evi_mean`, `savi_mean`, `moisture_status`, `indices_data`

**Output**:

```
Migrating database...
✅ Migration successful: Added missing columns.
```

**Troubleshooting**:

- **Error: `column already exists`**: Safe to ignore (idempotent migration)
- **Error: `SSL connections`**: Check `DATABASE_URL` has `?sslmode=require`

---

#### 13. Check Database Columns

```bash
cd backend
node check-columns.js
```

**Purpose**: Displays all columns in a table for debugging  
**When to use**: Verifying schema after migration  
**Output**:

```
Checking columns for field_analyses...
┌─────────┬───────────────────────┬───────────────┐
│ (index) │ column_name           │ data_type     │
├─────────┼───────────────────────┼───────────────┤
│ 0       │ 'id'                  │ 'integer'     │
│ 1       │ 'field_id'            │ 'integer'     │
│ 2       │ 'ndvi_mean'           │ 'numeric'     │
│ 3       │ 'soil_score'          │ 'integer'     │
└─────────┴───────────────────────┴───────────────┘
```

---

#### 14. Reset User Password

```bash
cd backend
node reset-password.js
```

**Purpose**: Resets a user's password to a known value  
**When to use**: Testing, or helping users who forgot password  
**What it does**:

1. Hashes new password with bcrypt
2. Updates `users` table
3. Displays new credentials

**Output**:

```
Resetting password for: user@example.com
New password will be: Test123!

✅ Password reset successful!
📋 Login Credentials:
  Email: user@example.com
  Password: Test123!
```

---

## Testing Commands

#### 15. Run Unit Tests (Forecasting)

```bash
cd backend
node test-forecasting.js
```

**Purpose**: Tests linear regression algorithm with sample data  
**When to use**: After modifying `forecastingService.js`  
**What it tests**:

- Improving trend (slope > 0)
- Declining trend (slope < 0)
- Insufficient data (< 2 points)

**Output**:

```
Testing Forecasting Service...

Test 1: Improving Trend
✅ PASS: Predicted score is 95 (expected ~95)
✅ PASS: Trend is 'improving'

Test 2: Declining Trend
✅ PASS: Predicted score is 35 (expected ~35)
✅ PASS: Trend is 'declining'

Test 3: Insufficient Data
✅ PASS: Returned null (expected null)

All tests passed! ✅
```

---

#### 16. Run Integration Test (AI Feature)

```bash
cd backend
node test-ai-feature.js
```

**Purpose**: End-to-end test of AI prediction feature  
**When to use**: After modifying analysis or forecasting logic  
**What it tests**:

1. User signup
2. Field creation
3. Earth Engine analysis
4. AI prediction generation

**Output**:

```
1. creating new user: tester_1768893260433@example.com...
✅ Signup successful. Token received.

2. Getting existing fields...
⚠️ No fields found. Creating a test field...
✅ Test field created.
Using Field ID: 5

3. Running Analysis with AI Prediction...
✅ Analysis Complete!
⚠️ Prediction object MISSING (need 2+ analyses)
Running analysis AGAIN to generate history...

✨ AI PREDICTION FOUND (on 2nd run) ✨
{
  "predictedDate": "2025-12-25T18:30:00.000Z",
  "predictedScore": 87,
  "trend": "stable",
  "slope": "0.0023",
  "confidence": "0.58"
}
```

---

#### 17. Test Login Endpoint

```bash
cd backend
node test-login.js
```

**Purpose**: Verifies authentication is working  
**When to use**: Debugging 401 errors  
**What it does**:

1. Sends POST to `/api/auth/login`
2. Displays response (token or error)

**Output (success)**:

```
Testing login...
✅ Login successful!
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Output (failure)**:

```
❌ Login failed: Invalid email or password
```

---

## Deployment Commands

### Render (Backend)

#### 18. Deploy to Render (Automatic)

```bash
git push origin main
```

**Purpose**: Triggers automatic deployment on Render  
**When to use**: After committing changes  
**What happens**:

1. Render detects new commit
2. Runs `npm install`
3. Runs `npm start`
4. Health check passes → switches traffic

**Monitor deployment**: <https://dashboard.render.com>

---

#### 19. View Render Logs

```bash
# Via Render Dashboard
# Go to: https://dashboard.render.com → Your Service → Logs

# Or via Render CLI (install first: npm install -g render)
render logs --service farmregen-api --tail
```

**Purpose**: Debug production errors  
**When to use**: After deployment fails or 500 errors occur

---

### Vercel (Frontend)

#### 20. Deploy to Vercel (Automatic)

```bash
git push origin main
```

**Purpose**: Triggers automatic deployment on Vercel  
**What happens**:

1. Vercel detects new commit
2. Runs `npm install`
3. Runs `npm run build`
4. Deploys to global CDN

**Monitor deployment**: <https://vercel.com/dashboard>

---

#### 21. Deploy to Vercel (Manual)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

**Purpose**: Manual deployment (bypassing Git)  
**When to use**: Testing hotfixes before committing

---

## Git Commands

#### 22. Check Git Status

```bash
git status
```

**Purpose**: Shows modified, staged, and untracked files  
**Output**:

```
On branch main
Changes not staged for commit:
  modified:   backend/src/server.js
  modified:   frontend/src/App.jsx

Untracked files:
  backend/test-new-feature.js
```

---

#### 23. Stage Files for Commit

```bash
# Stage single file
git add backend/src/server.js

# Stage all files
git add .

# Stage all files in directory
git add backend/
```

**Purpose**: Prepares files for commit  
**When to use**: Before committing changes

---

#### 24. Commit Changes

```bash
git commit -m "Add AI forecasting feature"
```

**Purpose**: Saves staged changes to local repository  
**Best practices**:

- Use present tense ("Add" not "Added")
- Be specific ("Fix login bug" not "Fix stuff")
- Keep under 50 characters

---

#### 25. Push to GitHub

```bash
git push origin main
```

**Purpose**: Uploads local commits to GitHub  
**When to use**: After committing changes  
**Triggers**: Automatic deployment on Render and Vercel

---

#### 26. Pull Latest Changes

```bash
git pull origin main
```

**Purpose**: Downloads latest commits from GitHub  
**When to use**: Before starting work (sync with team)  
**After pulling**: Run `npm install` in case dependencies changed

---

#### 27. Create New Branch

```bash
git checkout -b feature/new-feature
```

**Purpose**: Creates and switches to new branch  
**When to use**: Working on new features (keeps `main` stable)  
**Naming conventions**:

- `feature/feature-name`: New features
- `fix/bug-name`: Bug fixes
- `refactor/component-name`: Code refactoring

---

#### 28. Merge Branch

```bash
# Switch to main
git checkout main

# Merge feature branch
git merge feature/new-feature

# Push merged changes
git push origin main
```

**Purpose**: Integrates feature branch into main  
**When to use**: After feature is complete and tested

---

#### 29. View Commit History

```bash
git log --oneline --graph --all
```

**Purpose**: Shows commit history with visual branch graph  
**Output**:

```
* 249379d (HEAD -> main) Update auth routes, field model, and schema
* d732374 Update README files and main entry point
* dda6408 Update route protection components
* 22fe19b Update API service and auth store
```

---

## Debugging & Maintenance Commands

#### 30. Check Node Version

```bash
node --version
```

**Purpose**: Verifies Node.js version  
**Required**: v18.0.0 or higher  
**If outdated**: Download from <https://nodejs.org>

---

#### 31. Check npm Version

```bash
npm --version
```

**Purpose**: Verifies npm version  
**Required**: v9.0.0 or higher  
**Update npm**: `npm install -g npm@latest`

---

#### 32. Clear npm Cache

```bash
npm cache clean --force
```

**Purpose**: Fixes corrupted package installations  
**When to use**: After weird `npm install` errors  
**Follow up**: Delete `node_modules` and reinstall

---

#### 33. Delete node_modules and Reinstall

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Purpose**: Fixes dependency conflicts  
**When to use**: After pulling major changes or version mismatches

---

#### 34. Check for Outdated Packages

```bash
npm outdated
```

**Purpose**: Lists packages with newer versions  
**Output**:

```
Package         Current  Wanted  Latest
express         4.18.2   4.18.3  4.21.2
react           18.2.0   18.2.0  18.3.1
```

**Update package**: `npm install package@latest`

---

#### 35. Audit Security Vulnerabilities

```bash
npm audit
```

**Purpose**: Scans for known security vulnerabilities  
**Output**:

```
found 3 vulnerabilities (1 moderate, 2 high)
run `npm audit fix` to fix them
```

**Fix vulnerabilities**: `npm audit fix`

---

#### 36. Format Code (Prettier)

```bash
# Install Prettier
npm install -g prettier

# Format all files
prettier --write "**/*.{js,jsx,json,css,md}"
```

**Purpose**: Enforces consistent code style  
**When to use**: Before committing

---

#### 37. Lint Code (ESLint)

```bash
# Install ESLint
npm install -g eslint

# Run linter
eslint src/
```

**Purpose**: Catches code quality issues  
**Common issues**: Unused variables, missing semicolons, etc.

---

## Future Commands (Planned)

### Testing (To Be Implemented)

#### 38. Run All Tests

```bash
npm test
```

**Purpose**: Runs Jest test suite  
**Status**: Not yet implemented  
**Planned tests**:

- Unit tests for all services
- Integration tests for API endpoints
- E2E tests with Playwright

---

#### 39. Run Tests with Coverage

```bash
npm run test:coverage
```

**Purpose**: Generates code coverage report  
**Status**: Not yet implemented  
**Target**: 80% code coverage

---

### Database (To Be Implemented)

#### 40. Create Database Backup

```bash
pg_dump $DATABASE_URL > backup.sql
```

**Purpose**: Backs up entire database  
**When to use**: Before major migrations  
**Restore**: `psql $DATABASE_URL < backup.sql`

---

#### 41. Seed Database with Sample Data

```bash
node seed.js
```

**Purpose**: Populates database with test data  
**Status**: Not yet implemented  
**Planned data**:

- 10 sample users
- 50 sample fields
- 200 sample analyses

---

### Performance (To Be Implemented)

#### 42. Run Performance Benchmarks

```bash
npm run benchmark
```

**Purpose**: Measures API response times  
**Status**: Not yet implemented  
**Metrics**: p50, p95, p99 latency

---

#### 43. Analyze Bundle Size

```bash
npm run analyze
```

**Purpose**: Visualizes frontend bundle composition  
**Status**: Not yet implemented  
**Tool**: webpack-bundle-analyzer or vite-plugin-visualizer

---

### CI/CD (To Be Implemented)

#### 44. Run GitHub Actions Locally

```bash
act
```

**Purpose**: Tests GitHub Actions workflows locally  
**Status**: Not yet implemented  
**Requires**: Docker + `act` CLI

---

### Monitoring (To Be Implemented)

#### 45. View Application Metrics

```bash
# Via Datadog/New Relic dashboard
# Metrics: Request rate, error rate, latency, CPU, memory
```

**Status**: Not yet implemented  
**Planned**: Datadog integration

---

#### 46. View Error Logs (Sentry)

```bash
# Via Sentry dashboard
# https://sentry.io/organizations/farmregen/issues/
```

**Status**: Not yet implemented  
**Planned**: Sentry integration for error tracking

---

## Command Cheat Sheet

### Daily Development Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install dependencies (if package.json changed)
npm install

# 3. Start backend
cd backend && npm run dev

# 4. Start frontend (new terminal)
cd frontend && npm run dev

# 5. Make changes, test locally

# 6. Commit and push
git add .
git commit -m "Description of changes"
git push origin main
```

---

### Troubleshooting Workflow

```bash
# 1. Check logs
# Backend: Check terminal running `npm run dev`
# Frontend: Check browser console (F12)

# 2. Restart servers
# Ctrl+C to stop, then `npm run dev` again

# 3. Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# 4. Check database connection
psql $DATABASE_URL -c "SELECT 1"

# 5. Check environment variables
cat .env
```

---

### Deployment Workflow

```bash
# 1. Test locally
npm run build  # Frontend
npm start      # Backend

# 2. Commit changes
git add .
git commit -m "Deploy: description"

# 3. Push to trigger deployment
git push origin main

# 4. Monitor deployment
# Render: https://dashboard.render.com
# Vercel: https://vercel.com/dashboard

# 5. Check production logs
# Render: View logs in dashboard
# Vercel: View logs in dashboard
```

---

## Conclusion

This reference covers **all commands** used in the FarmRegen project, from initial setup to production deployment. Bookmark this document and refer to it whenever you need to:

- Set up the project on a new machine
- Debug issues during development
- Deploy updates to production
- Perform database migrations
- Run tests and benchmarks

**Pro tip**: Create shell aliases for frequently used commands:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias bd="cd ~/FarmRegen/backend && npm run dev"
alias fd="cd ~/FarmRegen/frontend && npm run dev"
alias gs="git status"
alias gp="git push origin main"
```

Happy coding! 🚀
