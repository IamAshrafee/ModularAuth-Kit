// ============================================================================
// ModularAuth-Kit — Nodemailer Email Adapter
// Production adapter using Nodemailer SMTP transport.
// ============================================================================

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import type { IEmailAdapter } from './email.adapter.interface.js';
import type { AuthConfig } from '../../auth.types.js';

export class NodemailerEmailAdapter implements IEmailAdapter {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(config: AuthConfig) {
    this.from = config.email.from;

    this.transporter = nodemailer.createTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: config.email.smtp.port === 465, // true for 465, false for other ports
      auth: {
        user: config.email.smtp.user,
        pass: config.email.smtp.pass,
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      html,
      text,
    });
  }
}
