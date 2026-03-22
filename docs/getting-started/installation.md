# Installation

## System Requirements

| Requirement | Minimum Version |
|---|---|
| Node.js | v18.0+ |
| npm | v9.0+ |
| MongoDB | v6.0+ |

## Install Dependencies

```bash
npm install
```

### Key Dependencies

| Package | Purpose |
|---|---|
| `express` | HTTP server |
| `mongoose` | MongoDB ODM |
| `argon2` | Password hashing (argon2id) |
| `zod` | Request validation |
| `helmet` | Security headers |
| `express-rate-limit` | Rate limiting |
| `cookie-parser` | Cookie handling |
| `dotenv` | Environment variables |
| `ua-parser-js` | Device detection |

## MongoDB Setup

**Local MongoDB:**

```bash
# Start MongoDB (varies by OS)
mongod --dbname modularauth
```

**MongoDB Atlas:**

Use your Atlas connection string in `.env`:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/modularauth
```

## Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

See [Environment Variables](environment-variables.md) for all options.
