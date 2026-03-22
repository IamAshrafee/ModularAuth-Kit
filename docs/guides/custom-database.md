# Guide: Custom Database

Implement repository interfaces to use any database (PostgreSQL, MySQL, DynamoDB, etc.).

## Repository Interfaces

All data access goes through four interfaces in `src/auth/repositories/interfaces/`:

| Interface | Methods |
|---|---|
| `IUserRepository` | `create`, `findById`, `findByEmail`, `findByUsername`, `update`, `resetFailedAttempts` |
| `ISessionRepository` | `create`, `findBySessionId`, `findByUserId`, `deleteBySessionId`, `deleteByUserId`, `touch`, `updateSessionId`, `countByUserId`, `deleteOldestByUserId` |
| `ITokenRepository` | `create`, `findByToken`, `deleteByToken`, `deleteByUserId` |
| `ILoginHistoryRepository` | `create`, `findByUserId`, `deleteOldEntries` |

## Steps

### 1. Create a New Repository Folder

```
src/auth/repositories/
├── interfaces/          ← Keep these unchanged
├── mongodb/             ← Existing MongoDB implementations
└── postgres/            ← Your new folder
    ├── user.repository.ts
    ├── session.repository.ts
    ├── token.repository.ts
    └── login-history.repository.ts
```

### 2. Implement Each Interface

```typescript
import type { IUserRepository } from '../interfaces/user.repository.interface.js';

export class PostgresUserRepository implements IUserRepository {
  async create(data: CreateUserDto): Promise<UserDocument> {
    // Your PostgreSQL logic here
  }
  // Implement all methods...
}
```

### 3. Update the Module Entry Point

In `src/auth/index.ts`, swap the repository imports:

```typescript
import { PostgresUserRepository } from './repositories/postgres/user.repository.js';

const userRepository = new PostgresUserRepository();
```

## Key Rules

- All repository methods must return the same types as defined in the interfaces
- The `_id` field must be a string-convertible value (`toString()`)
- Timestamps (`createdAt`, `updatedAt`) must be `Date` objects
