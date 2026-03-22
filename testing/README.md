# ModularAuth-Kit — Postman Testing Guide

> **Purpose:** Test every API endpoint in real-time using Postman. This folder contains step-by-step guides for testing all auth features — setup, request examples, expected responses, and verification checklists.

---

## Table of Contents

| Document | What It Covers |
|---|---|
| [Setup Guide](setup.md) | Install Postman, import collection, configure environment, start the server |
| [Core Auth Tests](core-auth.md) | Register, Login, Logout, Profile, Change Password |
| [Password Recovery Tests](password-recovery.md) | Forgot Password, Reset Password |
| [Email Verification Tests](email-verification.md) | Verify Email, Resend Verification Code |
| [Google OAuth Tests](google-oauth.md) | Google Login (browser-based flow) |
| [Login History Tests](login-history.md) | View Login History |
| [Session Management Tests](session-management.md) | List Active Sessions, Revoke Session/Device |
| [Account Lockout Tests](account-lockout.md) | Lockout after failed attempts, auto-unlock |
| [Security Tests](security-tests.md) | Rate limiting, enumeration protection, CSRF, headers |
| [Full Flow Scenarios](full-flow-scenarios.md) | End-to-end scenarios combining multiple features |

---

## How to Use

1. **Start with [Setup](setup.md)** — get Postman and the server ready
2. **Follow each test doc in order** — they build on each other (e.g., register before login)
3. **Use the checklists** — each test has a ✅/❌ verification checklist
4. **Test with different configs** — each doc explains which switches to toggle

---

## Quick Reference — All Endpoints

| Method | Endpoint | Auth? | Feature Switch |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Always ON |
| `POST` | `/auth/login` | ❌ | Always ON |
| `POST` | `/auth/logout` | ✅ | Always ON |
| `POST` | `/auth/logout-all` | ✅ | Always ON |
| `GET` | `/auth/me` | ✅ | Always ON |
| `PATCH` | `/auth/me` | ✅ | Always ON |
| `POST` | `/auth/change-password` | ✅ | Always ON |
| `POST` | `/auth/forgot-password` | ❌ | `passwordRecovery.enabled` |
| `POST` | `/auth/reset-password` | ❌ | `passwordRecovery.enabled` |
| `POST` | `/auth/verify-email` | ✅ | `emailVerification.enabled` |
| `POST` | `/auth/resend-verification` | ✅ | `emailVerification.enabled` |
| `GET` | `/auth/google` | ❌ | `login.allowGoogleOAuth` |
| `GET` | `/auth/google/callback` | ❌ | `login.allowGoogleOAuth` |
| `GET` | `/auth/sessions` | ✅ | `sessionManagement.enabled` |
| `DELETE` | `/auth/sessions/:id` | ✅ | `sessionManagement.enabled` |
| `GET` | `/auth/login-history` | ✅ | `loginHistory.enabled` |

> 📖 **For API implementation details:** See [docs/api/](../docs/api/) (user-facing API reference).
> 📖 **For architecture context:** See [dev-docs/](../dev-docs/README.md) (internal dev docs).
