[← Back to Index](../README.md)

> **Status:** ✅ Current | Last Updated: 2026-03-22

# Testing Guidelines

Patterns, tools, and expectations for testing the auth module.

---

## Table of Contents

- [Testing Strategy](#testing-strategy)
- [Test Categories](#test-categories)
- [Running Tests](#running-tests)
- [Test File Conventions](#test-file-conventions)
- [Mocking Patterns](#mocking-patterns)
- [What to Test per Layer](#what-to-test-per-layer)

---

## Testing Strategy

We use a **pyramid approach**: many unit tests, some integration tests, a few end-to-end tests.

```
        ╱╲
       ╱ E2E ╲          Few — test full request flows
      ╱────────╲
     ╱Integration╲      Some — test service + DB interactions
    ╱──────────────╲
   ╱   Unit Tests    ╲   Many — test individual functions/methods
  ╱────────────────────╲
```

---

## Test Categories

| Category | What It Tests | Database? | Example |
|---|---|---|---|
| **Unit** | Individual functions, pure logic | No (mocked) | `passwordService.hash()` returns valid hash |
| **Integration** | Services + repositories + real DB | Yes (test DB) | `authService.register()` creates user in MongoDB |
| **E2E** | Full HTTP request → response | Yes (test DB) | POST `/auth/login` with valid credentials returns 200 + cookie |

---

## Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only (requires MongoDB)
npm run test:integration

# Run with coverage
npm run test:coverage

# Type-check (no tests, just verify TypeScript)
npm run type-check
```

---

## Test File Conventions

| Source File | Test File |
|---|---|
| `services/auth.service.ts` | `__tests__/services/auth.service.test.ts` |
| `utils/crypto.ts` | `__tests__/utils/crypto.test.ts` |
| `http/controllers/auth.controller.ts` | `__tests__/http/auth.e2e.test.ts` |

- Test files use `.test.ts` suffix
- Tests mirror the source folder structure inside `__tests__/`
- Each test file tests one source file

---

## Mocking Patterns

### Repository Mocks (for Unit Testing Services)

```typescript
const mockUserRepository: IUserRepository = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  findById: jest.fn(),
  findByGoogleId: jest.fn(),
  updateById: jest.fn(),
  setEmailVerified: jest.fn(),
};
```

### Service Mocks (for Unit Testing Controllers)

```typescript
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  getProfile: jest.fn(),
};
```

---

## What to Test per Layer

### Services (Unit Tests)
- Business rule validation (e.g., duplicate email check)
- Correct method calls to repositories
- Correct error types thrown
- Config switch behavior (enabled vs disabled features)

### Repositories (Integration Tests)
- CRUD operations against real MongoDB
- Index enforcement (unique constraints)
- TTL behavior (if testable)

### Controllers (E2E Tests)
- HTTP status codes for success and error cases
- Response body format matches standard envelope
- Cookie setting/clearing behavior
- Rate limiting behavior
- Authentication middleware behavior

### Middleware (Unit Tests)
- Zod validation accepts valid input
- Zod validation rejects invalid input with correct error structure
- Auth middleware attaches user on valid session
- Auth middleware returns 401 on invalid/missing session

---

> 📖 **Related Docs:**
> - [Coding Standards](coding-standards.md) — naming conventions for test files
> - [API Response Format](api-response-format.md) — expected response structure for E2E tests
