// ============================================================================
// ModularAuth-Kit — Audit Logger
// Structured logging for auth events (login, register, password change, etc.)
// Outputs parseable JSON to console. Replace with production logger as needed.
// ============================================================================

/**
 * Data associated with an audit log entry.
 */
interface AuditLogData {
  userId?: string;
  ip?: string;
  success: boolean;
  detail?: string;
}

/**
 * Log a structured auth event to the console.
 *
 * @param event - Event type (e.g. 'login_success', 'register', 'password_change')
 * @param data - Event metadata
 */
export function auditLog(event: string, data: AuditLogData): void {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    userId: data.userId ?? null,
    ip: data.ip ?? null,
    success: data.success,
    detail: data.detail ?? null,
  };

  console.info(`[AUTH]`, JSON.stringify(entry));
}
