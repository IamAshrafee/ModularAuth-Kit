# ModularAuth-Kit Documentation

Complete authentication module for Express.js + MongoDB + TypeScript.

## Getting Started

- [Installation](getting-started/installation.md)
- [Quick Start](getting-started/quick-start.md)
- [Environment Variables](getting-started/environment-variables.md)
- [Project Structure](getting-started/project-structure.md)

## Configuration

- [Overview](configuration/overview.md) — How the config system works
- [Registration](configuration/registration.md) — Fields and validation
- [Login](configuration/login.md) — Identifiers and options
- [Sessions](configuration/sessions.md) — Cookie and session settings
- [Security](configuration/security.md) — Rate limiting, lockout, CSRF
- [Password Recovery](configuration/password-recovery.md) — Forgot/reset password
- [Email Verification](configuration/email-verification.md) — OTP verification
- [Google OAuth](configuration/google-oauth.md) — Google login setup
- [Login History](configuration/login-history.md) — Event tracking
- [Session Management](configuration/session-management.md) — Device management

## API Reference

- [Overview](api/overview.md) — Response format and conventions
- [Auth Endpoints](api/auth-endpoints.md) — Register, login, logout, profile
- [Password Endpoints](api/password-endpoints.md) — Forgot and reset password
- [Verification Endpoints](api/verification-endpoints.md) — Email verification
- [OAuth Endpoints](api/oauth-endpoints.md) — Google OAuth
- [Session Endpoints](api/session-endpoints.md) — Session management
- [History Endpoints](api/history-endpoints.md) — Login history
- [Error Codes](api/error-codes.md) — Complete error reference

## Guides

- [Adding Custom Fields](guides/adding-custom-fields.md)
- [Custom Email Provider](guides/custom-email-provider.md)
- [Custom Database](guides/custom-database.md)
- [Extending Middleware](guides/extending-middleware.md)
- [Modifying Auth Flows](guides/modifying-flows.md)
- [Deployment](guides/deployment.md)

## Use Case Scenarios

- [Express REST API](use-cases/express-rest-api.md) — Standard API setup
- [E-commerce Backend](use-cases/ecommerce-backend.md) — Online store auth
- [SaaS Application](use-cases/saas-app.md) — Full-featured with OAuth
- [Blog Platform](use-cases/blog-platform.md) — Username login
- [Minimal Setup](use-cases/minimal-setup.md) — Bare minimum

## Security

- [Overview](security/overview.md) — Security measures summary
- [Password Security](security/password-security.md) — Hashing details
- [Session Security](security/session-security.md) — Cookie security
- [Token Security](security/token-security.md) — Token handling
- [Best Practices](security/best-practices.md) — Production checklist
