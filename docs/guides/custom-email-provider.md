# Guide: Custom Email Provider

Implement a custom email adapter to use any email service (SendGrid, Mailgun, SES, etc.).

## The Interface

All email adapters implement `IEmailAdapter`:

```typescript
interface IEmailAdapter {
  send(options: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<void>;
}
```

## Create Your Adapter

```typescript
// src/auth/adapters/email/sendgrid.adapter.ts

import type { IEmailAdapter } from './email-adapter.interface.js';
import sgMail from '@sendgrid/mail';

export class SendGridEmailAdapter implements IEmailAdapter {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async send(options: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<void> {
    await sgMail.send({
      to: options.to,
      from: process.env.EMAIL_FROM!,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  }
}
```

## Wire It Up

In `src/auth/index.ts`, replace the email adapter selection:

```typescript
const emailAdapter = new SendGridEmailAdapter();
const emailService = new EmailService(emailAdapter);
```

## Built-In Adapters

| Adapter | Use Case |
|---|---|
| `ConsoleEmailAdapter` | Development — logs emails to console |
| `NodemailerEmailAdapter` | Production — uses SMTP via Nodemailer |
