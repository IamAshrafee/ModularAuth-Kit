# Changelog

## v1.0.0 — Initial Release

### Core (Phases 1–9)
- Type system, config factory, error classes, utility functions
- Mongoose models (User, Session, Token, LoginHistory)
- Repository interfaces + MongoDB implementations
- AuthService (register, login, logout, change-password)
- SessionService (create, validate, rotate, revoke, enforce limits)
- HTTP layer: controllers, middleware (auth, validation, rate limiting, security), routes
- Complete Zod validation schemas

### Password Recovery (Phase 10)
- TokenService for secure password reset tokens
- EmailService with pluggable adapters (Console, Nodemailer)
- Forgot-password and reset-password endpoints

### Email Verification (Phase 11)
- OTP-based email verification flow
- Verify-email and resend-verification endpoints

### Google OAuth (Phase 12)
- Direct HTTP OAuth 2.0 with PKCE (no Passport.js)
- Account resolution: Google ID → email match → new user
- State parameter for CSRF protection

### Login History (Phase 13)
- LoginHistoryService (record, getHistory, cleanup)
- Paginated GET /auth/login-history endpoint

### Session Management (Phase 14)
- List active sessions with device info and `isCurrent` flag
- Revoke sessions (ownership validated, can't revoke current)

### Account Lockout (Phase 15)
- Temporary lockout after N failed login attempts
- Auto-unlock after configurable duration

### Audit Logging (Phase 16)
- Structured JSON audit logs for all 14 auth events

### Module Entry Point (Phase 17)
- `createAuthModule(config)` — single function to wire everything
- Clean public API exports

### Documentation (Phase 18)
- 34 documentation files across configuration, API, guides, and security

### Integration Testing (Phase 19)
- Full E2E verification of all features with all switches ON
- Fixed changePassword login history recording bug

### Final Polish (Phase 20)
- Root README.md for GitHub
- Zero TODOs, zero TypeScript errors, zero npm vulnerabilities
