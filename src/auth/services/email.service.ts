// ============================================================================
// ModularAuth-Kit — Email Service
// Composes and sends password reset and email verification emails.
// Uses the configured email adapter (console for dev, nodemailer for prod).
// ============================================================================

import type { AuthConfig } from '../auth.types.js';
import type { IEmailAdapter } from '../adapters/email/email.adapter.interface.js';

// ============================================================================
// Email Service Class
// ============================================================================

export class EmailService {
  private readonly adapter: IEmailAdapter;

  constructor(adapter: IEmailAdapter) {
    this.adapter = adapter;
  }

  // --------------------------------------------------------------------------
  // sendPasswordReset
  // --------------------------------------------------------------------------

  /**
   * Send a password reset email with the raw token.
   * The token is included in a URL that loads a reset form.
   */
  async sendPasswordReset(
    email: string,
    rawToken: string,
    config: AuthConfig,
  ): Promise<void> {
    const expiryMinutes = config.passwordRecovery.tokenExpiryMinutes;

    const subject = 'Reset Your Password';

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Password Reset</h2>
  <p>You requested a password reset. Use the token below to reset your password:</p>
  <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0; font-family: monospace; font-size: 14px; word-break: break-all;">
    ${rawToken}
  </div>
  <p style="color: #666; font-size: 14px;">
    This token expires in <strong>${expiryMinutes} minutes</strong>.
  </p>
  <p style="color: #999; font-size: 12px;">
    If you didn't request this, you can safely ignore this email.
  </p>
</body>
</html>`.trim();

    const text = [
      'Password Reset',
      '',
      'You requested a password reset. Use the token below:',
      '',
      `Token: ${rawToken}`,
      '',
      `This token expires in ${expiryMinutes} minutes.`,
      '',
      "If you didn't request this, you can safely ignore this email.",
    ].join('\n');

    await this.adapter.sendEmail(email, subject, html, text);
  }

  // --------------------------------------------------------------------------
  // sendVerification
  // --------------------------------------------------------------------------

  /**
   * Send an email verification email with the OTP code.
   */
  async sendVerification(
    email: string,
    code: string,
    config: AuthConfig,
  ): Promise<void> {
    const expiryMinutes = config.emailVerification.codeExpiryMinutes;

    const subject = 'Verify Your Email';

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Email Verification</h2>
  <p>Use the code below to verify your email address:</p>
  <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">
    ${code}
  </div>
  <p style="color: #666; font-size: 14px;">
    This code expires in <strong>${expiryMinutes} minutes</strong>.
  </p>
  <p style="color: #999; font-size: 12px;">
    If you didn't create an account, you can safely ignore this email.
  </p>
</body>
</html>`.trim();

    const text = [
      'Email Verification',
      '',
      'Use the code below to verify your email:',
      '',
      `Code: ${code}`,
      '',
      `This code expires in ${expiryMinutes} minutes.`,
      '',
      "If you didn't create an account, you can safely ignore this email.",
    ].join('\n');

    await this.adapter.sendEmail(email, subject, html, text);
  }
}
