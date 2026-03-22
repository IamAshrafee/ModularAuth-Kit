// ============================================================================
// ModularAuth-Kit — Email Adapter Interface
// Database-agnostic contract for email delivery.
// ============================================================================

/**
 * Contract for email delivery adapters.
 * Implementations: ConsoleEmailAdapter (dev), NodemailerEmailAdapter (prod)
 */
export interface IEmailAdapter {
  sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
  ): Promise<void>;
}
