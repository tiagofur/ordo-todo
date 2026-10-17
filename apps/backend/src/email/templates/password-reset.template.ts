import {
  EmailTemplate,
  EmailTemplateData,
} from '../interfaces/email-template.interface';

export const passwordResetTemplate = (
  data: EmailTemplateData & {
    resetToken: string;
    resetUrl?: string;
  },
): EmailTemplate => {
  const { user, resetToken } = data;
  const frontendUrl =
    data.resetUrl ||
    `${process.env.FRONTEND_URL || 'http://localhost:3100'}/reset-password?token=${resetToken}`;

  return {
    subject: 'Reset your Ordo-Todo password 🔐',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your password</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            max-width: 600px;
            margin: 0 auto;
            padding: 24px;
            background-color: #f8fafc;
          }
          .container {
            background-color: #ffffff;
            border-radius: 16px;
            padding: 36px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            color: #06b6d4;
            letter-spacing: -0.5px;
            margin-bottom: 24px;
          }
          .title {
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 16px;
          }
          .btn {
            display: inline-block;
            background-color: #06b6d4;
            color: #ffffff !important;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 15px;
            margin: 24px 0;
            text-align: center;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 14px 18px;
            border-radius: 6px;
            font-size: 13px;
            color: #92400e;
            margin: 20px 0;
          }
          .footer {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 32px;
            border-top: 1px solid #f1f5f9;
            padding-top: 18px;
          }
          .code-box {
            background-color: #f1f5f9;
            padding: 12px;
            border-radius: 6px;
            font-family: monospace;
            word-break: break-all;
            font-size: 12px;
            color: #475569;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">ORDO TODO</div>
          <div class="title">Password Reset Request</div>
          <p>Hello ${user?.name || 'there'},</p>
          <p>We received a request to reset your password for your Ordo-Todo account. Click the button below to choose a new password:</p>
          
          <div style="text-align: center;">
            <a href="${frontendUrl}" class="btn" target="_blank">Reset Password</a>
          </div>

          <div class="warning">
            <strong>Security Notice:</strong> This link is valid for <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email — your account remains completely secure.
          </div>

          <p style="font-size: 13px; color: #64748b;">
            If the button doesn't work, copy and paste this URL into your browser:
          </p>
          <div class="code-box">${frontendUrl}</div>

          <div class="footer">
            Ordo-Todo Security Team &bull; This is an automated message.
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hello ${user?.name || 'there'},

We received a request to reset your password for your Ordo-Todo account.
Reset your password using the following link (valid for 1 hour):

${frontendUrl}

If you did not request a password reset, you can safely ignore this email.

— Ordo-Todo Team
    `.trim(),
  };
};
