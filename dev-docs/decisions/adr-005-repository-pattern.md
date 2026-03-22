[← Back to Index](../README.md)

> **Status:** ✅ Current | Last Updated: 2026-03-22

# ADR-005: Repository Pattern for Database Flexibility

## Status
**Accepted**

## Context
We need to decide how services access the database. Options include: direct Mongoose calls in services, a generic ORM/query builder, or a repository pattern with interfaces.

## Decision
We will use the **Repository Pattern** — services depend on interfaces, and MongoDB implementations fulfill those interfaces.

## Rationale

### What the Repository Pattern Gives Us

```
Services ──call──▶ Repository Interface (contract)
                          │
                   ┌──────┴──────┐
                   ▼              ▼
            MongoDB Repo    (Future) PostgreSQL Repo
```

**1. Database-agnostic business logic.**
Services call `userRepository.findByEmail(email)` — they don't know or care if this queries MongoDB, PostgreSQL, or an in-memory store. Business logic never imports Mongoose.

**2. Easy to swap databases.**
To add PostgreSQL support, create `repositories/postgresql/user.repository.ts` that implements `IUserRepository`. The services don't change.

**3. Testability.**
In unit tests, we can create mock repositories that return predefined data — no real database needed.

**4. Clean separation of concerns.**
- Services handle **business rules** ("is this password correct?")
- Repositories handle **data access** ("find a document where email = x")

### Interface Example

```typescript
interface IUserRepository {
  create(data: CreateUserDto): Promise<UserDocument>;
  findByEmail(email: string): Promise<UserDocument | null>;
  findByUsername(username: string): Promise<UserDocument | null>;
  findById(id: string): Promise<UserDocument | null>;
  findByGoogleId(googleId: string): Promise<UserDocument | null>;
  updateById(id: string, data: Partial<UpdateUserDto>): Promise<UserDocument | null>;
  setEmailVerified(id: string): Promise<void>;
}
```

### Why Not Direct Mongoose Calls?

If services called Mongoose directly:
- Switching databases would require rewriting all services
- Business logic would be mixed with MongoDB query syntax
- Testing would require a MongoDB instance or complex mocking

## Consequences
- **Positive:** Database flexibility, clean separation, testable
- **Positive:** Forces clean data access patterns
- **Negative:** More files (interface + implementation for each entity)
- **Negative:** Slightly more initial setup than direct Mongoose calls

## Alternatives Considered
- **Direct Mongoose in services:** Rejected — couples business logic to MongoDB
- **Generic ORM (Prisma, TypeORM):** Rejected — adds heavy dependency, reduces transparency
- **Active Record pattern:** Rejected — mixes data access with domain models

---

> 📖 **Related:** [Folder Structure](../architecture/folder-structure.md) — repository folder layout.
