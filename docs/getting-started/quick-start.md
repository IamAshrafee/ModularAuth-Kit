# Quick Start

Get ModularAuth-Kit running in 5 minutes.

---

## Prerequisites

- **Node.js** v18+
- **MongoDB** running locally or a connection string (e.g., MongoDB Atlas)

## Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd ModularAuth-Kit

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env and set:
#   SESSION_SECRET=<random 32+ char string>
#   MONGODB_URI=mongodb://localhost:27017/modularauth

# 4. Start the development server
npm run dev
```

You should see:

```
[SERVER] Connected to MongoDB
[SERVER] ModularAuth-Kit running on http://localhost:3000
```

## First Test

```bash
# Health check
curl http://localhost:3000/health

# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"Test1234!"}'
```

---

See [Auth Endpoints](../api/auth-endpoints.md) for full API reference.
