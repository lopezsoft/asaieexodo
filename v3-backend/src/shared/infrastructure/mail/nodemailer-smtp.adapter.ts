import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import {
  CrmEmailNotificationPayload,
  EmailConfirmationPayload,
  MailDeliveryResult,
  MailSenderPort,
  PasswordChangedAlertPayload,
  PasswordResetEmailPayload,
  SendTransactionalEmailInput,
} from '../../application/ports/mail-sender.port';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { SmartLoggerService } from '../logging/smart-logger.service';

/**
 * Adaptador de infraestructura SMTP basado en Nodemailer para el envio de
 * correos transaccionales (confirmaciones de cuenta, recuperacion y cambio
 * de contrasena, y notificaciones omnicanal del CRM Escolar).
 *
 * Cumple Seguridad por Diseno:
 * - Escapa todo contenido interpolado en HTML (prevencion XSS/HTML Injection).
 * - Sanitiza encabezados contra inyeccion CRLF.
 * - Valida URLs CTA (solo http/https) y exige TLS en puerto 587.
 * - Jamas registra tokens ni credenciales en logs.
 */
@Injectable()
export class NodemailerSmtpMailAdapter implements MailSenderPort {
  private readonly transporter: Transporter;
  private readonly fromAddress: string;
  private readonly fromName: string;
  private readonly isTestEnvironment: boolean;
  private readonly isProduction: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: SmartLoggerService,
  ) {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    this.isTestEnvironment = nodeEnv === 'test';
    this.isProduction = nodeEnv === 'production';

    const host = this.configService.get<string>(
      'MAIL_HOST',
      'email-smtp.us-west-2.amazonaws.com',
    );
    const port = Number(this.configService.get<string>('MAIL_PORT', '587'));
    const encryption = this.configService
      .get<string>('MAIL_ENCRYPTION', 'tls')
      .toLowerCase();
    const user = this.configService.get<string>('MAIL_USERNAME', '').trim();
    const pass = this.configService.get<string>('MAIL_PASSWORD', '').trim();

    if (
      this.isProduction &&
      (!user ||
        !pass ||
        user.startsWith('YOUR_') ||
        pass.startsWith('YOUR_'))
    ) {
      throw new Error(
        'Credenciales SMTP (MAIL_USERNAME / MAIL_PASSWORD) invalidas o faltantes en produccion.',
      );
    }

    this.fromAddress = this.sanitizeHeader(
      this.configService.get<string>(
        'MAIL_FROM_ADDRESS',
        'no-reply@asaie.co',
      ),
    );
    this.fromName = this.sanitizeHeader(
      this.configService.get<string>(
        'MAIL_FROM_NAME',
        'ASAIE EXODO - Comunidad Educativa',
      ),
    );

    if (this.isTestEnvironment) {
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    } else {
      const isDirectSsl = encryption === 'ssl' || port === 465;
      const requireStartTls =
        !isDirectSsl && (encryption === 'tls' || encryption === 'starttls');

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: isDirectSsl,
        requireTLS: requireStartTls,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
        tls: {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: this.isProduction,
        },
        auth: user && pass ? { user, pass } : undefined,
      });
    }
  }

  public async sendTransactionalEmail(
    input: SendTransactionalEmailInput,
    templateType: MailDeliveryResult['templateType'] = 'CUSTOM',
  ): Promise<MailDeliveryResult> {
    const safeTo = this.sanitizeHeader(input.to);
    const safeSubject = this.sanitizeHeader(input.subject);

    try {
      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromAddress}>`,
        to: safeTo,
        subject: safeSubject,
        html: input.html,
        text: input.text,
      });

      this.logger.log(
        `Correo transaccional (${templateType}) procesado mediante Nodemailer`,
        {
          messageId: info.messageId,
          templateType,
        },
      );

      return {
        delivered: true,
        messageId: info.messageId || `asaie-${Date.now()}`,
        provider: this.isTestEnvironment
          ? 'NODEMAILER_JSON_TEST'
          : 'NODEMAILER_SMTP',
        recipientEmail: safeTo,
        templateType,
      };
    } catch (error) {
      const smtpError = error as {
        message?: string;
        code?: string;
        responseCode?: number;
        command?: string;
      };
      this.logger.error(
        `Fallo al enviar correo transaccional (${templateType})`,
        {
          templateType,
          errorMessage: smtpError?.message ?? 'Error SMTP desconocido',
          code: smtpError?.code,
          responseCode: smtpError?.responseCode,
          command: smtpError?.command,
        },
        NodemailerSmtpMailAdapter.name,
      );
      return {
        delivered: false,
        messageId: `failed-${Date.now()}`,
        provider: 'NODEMAILER_SMTP',
        recipientEmail: safeTo,
        templateType,
      };
    }
  }

  public async sendEmailConfirmation(
    payload: EmailConfirmationPayload,
  ): Promise<MailDeliveryResult> {
    const safeName = this.escapeHtml(payload.recipientFullName);
    const safeSchool = this.escapeHtml(payload.schoolName ?? 'ASAIE ÉXODO');
    const safeUrl = this.validateSafeHttpUrl(payload.confirmationUrl);

    const html = this.buildInstitutionalLayout({
      badge: 'VERIFICACIÓN DE CUENTA',
      title: `Hola, ${safeName}`,
      bodyHtml: `
        <p>Bienvenido(a) al portal unificado de la comunidad educativa <strong>${safeSchool}</strong>.</p>
        <p>Para confirmar tu dirección de correo electrónico y activar las notificaciones académicas y del CRM Escolar, haz clic en el siguiente botón:</p>
      `,
      ctaLabel: 'Confirmar Correo Electrónico',
      ctaUrl: safeUrl,
      footerNote:
        'Si no solicitaste esta verificación, puedes ignorar este mensaje de forma segura.',
    });

    const text = [
      `Hola, ${payload.recipientFullName}.`,
      `Confirma tu correo electrónico en ${payload.schoolName ?? 'ASAIE ÉXODO'} abriendo el siguiente enlace:`,
      safeUrl,
    ].join('\n\n');

    return this.sendTransactionalEmail(
      {
        to: payload.recipientEmail,
        subject: 'Confirmación de correo electrónico — ASAIE ÉXODO',
        html,
        text,
      },
      'EMAIL_CONFIRMATION',
    );
  }

  public async sendPasswordResetEmail(
    payload: PasswordResetEmailPayload,
  ): Promise<MailDeliveryResult> {
    const safeName = this.escapeHtml(payload.recipientFullName);
    const safeUrl = this.validateSafeHttpUrl(payload.resetUrl);
    const safeMinutes = Math.max(1, Math.floor(payload.expiresInMinutes));

    const html = this.buildInstitutionalLayout({
      badge: 'RECUPERACIÓN DE CONTRASEÑA',
      title: `Solicitud de restablecimiento para ${safeName}`,
      bodyHtml: `
        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>ASAIE ÉXODO</strong>.</p>
        <p>Este enlace es de un solo uso y es válido únicamente durante los próximos <strong>${safeMinutes} minutos</strong>:</p>
      `,
      ctaLabel: 'Restablecer Mi Contraseña',
      ctaUrl: safeUrl,
      footerNote:
        'Si tú no realizaste esta solicitud, tu contraseña actual permanece protegida y no necesitas realizar ninguna acción.',
    });

    const text = [
      `Hola, ${payload.recipientFullName}.`,
      `Recibimos una solicitud para restablecer tu contraseña en ASAIE ÉXODO (enlace de un solo uso válido por ${safeMinutes} minutos):`,
      safeUrl,
    ].join('\n\n');

    return this.sendTransactionalEmail(
      {
        to: payload.recipientEmail,
        subject: 'Recuperación de contraseña — ASAIE ÉXODO',
        html,
        text,
      },
      'PASSWORD_RESET',
    );
  }

  public async sendPasswordChangedAlert(
    payload: PasswordChangedAlertPayload,
  ): Promise<MailDeliveryResult> {
    const safeName = this.escapeHtml(payload.recipientFullName);
    const safeChangedAt = this.escapeHtml(payload.changedAtIso);

    const html = this.buildInstitutionalLayout({
      badge: 'ALERTA DE SEGURIDAD',
      title: 'Contraseña actualizada exitosamente',
      bodyHtml: `
        <p>Hola <strong>${safeName}</strong>,</p>
        <p>Te confirmamos que la contraseña de tu cuenta en <strong>ASAIE ÉXODO</strong> fue actualizada el <strong>${safeChangedAt}</strong> y tus sesiones anteriores fueron cerradas por seguridad.</p>
        <p>Si reconoces esta actividad, no necesitas hacer nada más. En caso contrario, comunícate de inmediato con la coordinación o soporte técnico de tu institución educativa.</p>
      `,
      footerNote:
        'Notificación automática de seguridad del Sistema de Identidad y Acceso (IAM) de ASAIE ÉXODO.',
    });

    const text = `Hola ${payload.recipientFullName}. Tu contraseña en ASAIE ÉXODO fue actualizada el ${payload.changedAtIso}. Si no reconoces este cambio, contacta de inmediato a soporte institucional.`;

    return this.sendTransactionalEmail(
      {
        to: payload.recipientEmail,
        subject: 'Alerta de seguridad: Cambio de contraseña — ASAIE ÉXODO',
        html,
        text,
      },
      'PASSWORD_CHANGED_ALERT',
    );
  }

  public async sendCrmOmnichannelNotification(
    payload: CrmEmailNotificationPayload,
  ): Promise<MailDeliveryResult> {
    const safeSchool = this.escapeHtml(payload.schoolName);
    const safeSubject = this.escapeHtml(payload.subject);
    const safeName = this.escapeHtml(payload.recipientFullName);
    const safeBodyHtml = this.escapeHtml(payload.messageBody).replace(
      /\r?\n/g,
      '<br />',
    );

    const html = this.buildInstitutionalLayout({
      badge: `CRM ESCOLAR — ${safeSchool}`,
      title: safeSubject,
      bodyHtml: `
        <p>Estimado(a) <strong>${safeName}</strong>,</p>
        <div style="padding:16px; background:#f8fafc; border-left:4px solid #1e40af; border-radius:4px; margin:16px 0;">
          ${safeBodyHtml}
        </div>
      `,
      footerNote: `Mensaje enviado a través del CRM Escolar Omnicanal de ${safeSchool}.`,
    });

    const text = `Estimado(a) ${payload.recipientFullName},\n\n${payload.messageBody}\n\n— CRM Escolar de ${payload.schoolName}`;

    return this.sendTransactionalEmail(
      {
        to: payload.recipientEmail,
        subject: `[${this.sanitizeHeader(payload.schoolName)}] ${this.sanitizeHeader(payload.subject)}`,
        html,
        text,
      },
      'CRM_OMNICHANNEL',
    );
  }

  private escapeHtml(value: string): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private sanitizeHeader(value: string): string {
    return String(value ?? '')
      .replace(/[\r\n\0]+/g, ' ')
      .trim();
  }

  private validateSafeHttpUrl(rawUrl: string): string {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      throw new DomainException(
        'INVALID_EMAIL_CTA_URL',
        'El enlace de acción generado para el correo no es una URL válida.',
      );
    }

    const isAllowedProtocol =
      parsed.protocol === 'https:' ||
      (!this.isProduction && parsed.protocol === 'http:');

    if (!isAllowedProtocol) {
      throw new DomainException(
        'UNSAFE_EMAIL_CTA_URL',
        'El protocolo de la URL del correo no cumple las políticas de seguridad.',
      );
    }

    return parsed.toString();
  }

  private buildInstitutionalLayout(params: {
    badge: string;
    title: string;
    bodyHtml: string;
    ctaLabel?: string;
    ctaUrl?: string;
    footerNote: string;
  }): string {
    const ctaBlock =
      params.ctaLabel && params.ctaUrl
        ? `<div style="margin:28px 0; text-align:center;">
             <a href="${this.escapeHtml(params.ctaUrl)}" style="background:#1e40af; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:600; display:inline-block;">
               ${this.escapeHtml(params.ctaLabel)}
             </a>
           </div>`
        : '';

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:24px; background:#f1f5f9; font-family:'Segoe UI', Roboto, Arial, sans-serif; color:#1e293b;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(15,23,42,0.08);">
    <div style="background:#0f172a; color:#ffffff; padding:20px 28px;">
      <span style="font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#93c5fd; font-weight:700;">${params.badge}</span>
      <h2 style="margin:8px 0 0; font-size:20px; font-weight:600;">${params.title}</h2>
    </div>
    <div style="padding:28px; line-height:1.6; font-size:15px;">
      ${params.bodyHtml}
      ${ctaBlock}
      <hr style="border:none; border-top:1px solid #e2e8f0; margin:24px 0;" />
      <p style="font-size:12px; color:#64748b; margin:0;">${params.footerNote}</p>
    </div>
  </div>
</body>
</html>`;
  }
}
