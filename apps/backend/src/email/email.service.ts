import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';
import { workspaceInvitationTemplate } from './templates/workspace-invitation.template';
import { passwordResetTemplate } from './templates/password-reset.template';
import { welcomeTemplate } from './templates/welcome.template';
import { taskReminderTemplate } from './templates/task-reminder.template';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  previewUrl?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private readonly fromAddress: string;
  private readonly isConfigured: boolean;

  constructor(private readonly configService: ConfigService) {
    this.fromAddress =
      this.configService.get<string>('EMAIL_FROM') ||
      process.env.EMAIL_FROM ||
      'Ordo-Todo <no-reply@ordo-todo.app>';

    const resendApiKey =
      this.configService.get<string>('RESEND_API_KEY') || process.env.RESEND_API_KEY;
    const smtpHost =
      this.configService.get<string>('SMTP_HOST') ||
      process.env.SMTP_HOST ||
      (resendApiKey ? 'smtp.resend.com' : undefined);
    const smtpPort = parseInt(
      this.configService.get<string>('SMTP_PORT') || process.env.SMTP_PORT || '587',
      10,
    );
    const smtpUser =
      this.configService.get<string>('SMTP_USER') ||
      process.env.SMTP_USER ||
      (resendApiKey ? 'resend' : undefined);
    const smtpPass =
      this.configService.get<string>('SMTP_PASS') ||
      process.env.SMTP_PASS ||
      resendApiKey;
    const smtpSecure =
      this.configService.get<string>('SMTP_SECURE') === 'true' ||
      process.env.SMTP_SECURE === 'true' ||
      smtpPort === 465;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });
        this.isConfigured = true;
        this.logger.log(
          `Email service initialized with SMTP transport: ${smtpHost}:${smtpPort} (user: ${smtpUser})`,
        );
      } catch (err: any) {
        this.logger.error(`Failed to initialize SMTP transporter: ${err.message}`);
        this.isConfigured = false;
      }
    } else {
      this.isConfigured = false;
      this.logger.warn(
        'Email service running in DEV / MOCK mode (no SMTP or RESEND_API_KEY configured). Emails will be logged to console.',
      );
    }
  }

  /**
   * Check if real transactional SMTP transport is active
   */
  hasRealTransport(): boolean {
    return this.isConfigured && this.transporter !== null;
  }

  /**
   * Core send email method
   */
  async sendEmail(dto: SendEmailDto): Promise<SendEmailResult> {
    try {
      if (this.transporter && this.isConfigured) {
        const info = await this.transporter.sendMail({
          from: this.fromAddress,
          to: dto.to,
          cc: dto.cc,
          bcc: dto.bcc,
          subject: dto.subject,
          text: dto.text,
          html: dto.html,
        });

        this.logger.log(`Email sent to ${dto.to} [subject: "${dto.subject}"]: id=${info.messageId}`);
        return {
          success: true,
          messageId: info.messageId,
        };
      }

      // Dev / Mock fallback
      this.logger.log(
        `[DEV EMAIL DISPATCHED] To: ${dto.to} | Subject: "${dto.subject}" | From: ${this.fromAddress}`,
      );
      if (dto.text) {
        this.logger.debug(`[DEV EMAIL TEXT PREVIEW]\n${dto.text.slice(0, 300)}...`);
      }

      return {
        success: true,
        messageId: `mock-${Date.now()}`,
      };
    } catch (error: any) {
      this.logger.error(`Error sending email to ${dto.to}: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send Workspace Member Invitation Email
   */
  async sendWorkspaceInvitation(data: {
    to: string;
    userName?: string;
    inviterName: string;
    workspaceName: string;
    workspaceColor?: string;
    token: string;
  }): Promise<SendEmailResult> {
    const template = workspaceInvitationTemplate({
      user: {
        name: data.userName || data.to.split('@')[0],
        email: data.to,
      },
      workspace: {
        name: data.workspaceName,
        color: data.workspaceColor,
      },
      inviter: {
        name: data.inviterName,
      },
      invitationToken: data.token,
    });

    return this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send Password Reset Email
   */
  async sendPasswordReset(data: {
    to: string;
    userName?: string;
    resetToken: string;
    resetUrl?: string;
  }): Promise<SendEmailResult> {
    const template = passwordResetTemplate({
      user: {
        name: data.userName || data.to.split('@')[0],
        email: data.to,
      },
      resetToken: data.resetToken,
      resetUrl: data.resetUrl,
    });

    return this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send Welcome Email
   */
  async sendWelcome(data: {
    to: string;
    userName: string;
  }): Promise<SendEmailResult> {
    const template = welcomeTemplate({
      user: {
        name: data.userName,
        email: data.to,
      },
    });

    return this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send Task Reminder Email
   */
  async sendTaskReminder(data: {
    to: string;
    userName: string;
    taskTitle: string;
    taskDueDate: Date;
    taskPriority: string;
    projectName?: string;
  }): Promise<SendEmailResult> {
    const template = taskReminderTemplate({
      user: {
        name: data.userName,
        email: data.to,
      },
      task: {
        title: data.taskTitle,
        dueDate: data.taskDueDate,
        priority: data.taskPriority,
      },
      project: {
        name: data.projectName || 'Default Project',
      },
    });

    return this.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }
}
