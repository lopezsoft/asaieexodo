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
import { SmartLoggerService } from '../logging/smart-logger.service';

/**
 * Adaptador de infraestructura SMTP basado en Nodemailer para el envio de
 * correos transaccionales (confirmaciones de cuenta, recuperacion y cambio
 * de contrasena, y notificaciones omnicanal del CRM Escolar).
 *
 * Cumple Seguridad por Diseno: jamas registra tokens ni credenciales en logs.
 */
@Injectable()
export class NodemailerSmtpMailAdapter implements MailSenderPort {
  private readonly transporter: Transporter;
  private readonly fromAddress: string;
  private readonly fromName: string;
  private readonly isTestEnvironment: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: SmartLoggerService,
  ) {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    this.isTestEnvironment = nodeEnv === 'test';

    const host = this.configService.get<string>(
      'MAIL_HOST',
      'mail.asaie.co',
    );
    const port = Number(this.configService.get<string>('MAIL_PORT', '465'));
    const encryption = this.configService
      .get<string>('MAIL_ENCRYPTION', 'ssl')
      .toLowerCase();
    const user = this.configService.get<string>('MAIL_USERNAME', '');
    const pass = this.configService.get<string>('MAIL_PASSWORD', '');

    this.fromAddress = this.configService.get<string>(
      'MAIL_FROM_ADDRESS',
      user || 'notificaciones@asaie.co',
    );
    this.fromName = this.configService.get<string>(
      'MAIL_FROM_NAME',
      'ASAIE ÉXODO - Comunidad Educativa',
    );

    if (this.isTestEnvironment) {
      // En entorno de pruebas automatizadas Jest se utiliza jsonTransport de Nodemailer
      // para validar plantillas y entrega sin disparar trafico SMTP externo.
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    } else {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: encryption === 'ssl' || port === 465,
        auth: user && pass ? { user, pass } : undefined,
      });
    }
  }

  public async sendTransactionalEmail(
    input: SendTransactionalEmailInput,
    templateType: MailDeliveryResult['templateType'] = 'CUSTOM',
  ): Promise<MailDeliveryResult> {
    try {
      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromAddress}>`,
        to: input.to,
        subject: input.subject,
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
        recipientEmail: input.to,
        templateType,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error SMTP desconocido';
      this.logger.error(
        `Fallo al enviar correo transaccional (${templateType}): ${errorMessage}`,
        undefined,
        NodemailerSmtpMailAdapter.name,
      );
      return {
        delivered: false,
        messageId: `failed-${Date.now()}`,
        provider: 'NODEMAILER_SMTP',
        recipientEmail: input.to,
        templateType,
      };
    }
  }

  public async sendEmailConfirmation(
    payload: EmailConfirmationPayload,
  ): Promise<MailDeliveryResult> {
    const html = this.buildInstitutionalLayout({
      badge: 'VERIFICACIÓN DE CUENTA',
      title: `Hola, ${payload.recipientFullName}`,
      bodyHtml: `
        <p>Bienvenido(a) al portal unificado de la comunidad educativa <strong>${payload.schoolName ?? 'ASAIE ÉXODO'}</strong>.</p>
        <p>Para confirmar tu dirección de correo electrónico y activar las notificaciones académicas y del CRM Escolar, haz clic en el siguiente botón:</p>
      `,
      ctaLabel: 'Confirmar Correo Electrónico',
      ctaUrl: payload.confirmationUrl,
      footerNote:
        'Si no solicitaste esta verificación, puedes ignorar este mensaje de forma segura.',
    });

    return this.sendTransactionalEmail(
      {
        to: payload.recipientEmail,
        subject: 'Confirmación de correo electrónico — ASAIE ÉXODO',
        html,
      },
      'EMAIL_CONFIRMATION',
    );
  }

  public async sendPasswordResetEmail(
    payload: PasswordResetEmailPayload,
  ): Promise<MailDeliveryResult> {
    const html = this.buildInstitutionalLayout({
      badge: 'RECUPERACIÓN DE CONTRASEÑA',
      title: `Solicitud de restablecimiento para ${payload.recipientFullName}`,
      bodyHtml: `
        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>ASAIE ÉXODO</strong>.</p>
        <p>Este enlace es válido únicamente durante los próximos <strong>${payload.expiresInMinutes} minutos</strong>:</p>
      `,
      ctaLabel: 'Restablecer Mi Contraseña',
      ctaUrl: payload.resetUrl,
      footerNote:
        'Si tú no realizaste esta solicitud, tu contraseña actual permanece protegida y no necesitas realizar ninguna acción.',
    });

    return this.sendTransactionalEmail(
      {
        to: payload.recipientEmail,
        subject: 'Recuperación de contraseña — ASAIE ÉXODO',
        html,
      },
      'PASSWORD_RESET',
    );
  }

  public async sendPasswordChangedAlert(
    payload: PasswordChangedAlertPayload,
  ): Promise<MailDeliveryResult> {
    const html = this.buildInstitutionalLayout({
      badge: 'ALERTA DE SEGURIDAD',
      title: `Contraseña actualizada exitosamente`,
      bodyHtml: `
        <p>Hola <strong>${payload.recipientFullName}</strong>,</p>
        <p>Te confirmamos que la contraseña de tu cuenta en <strong>ASAIE ÉXODO</strong> fue actualizada el <strong>${payload.changedAtIso}</strong>.</p>
        <p>Si reconoces esta actividad, no necesitas hacer nada más. En caso contrario, comunícate de inmediato con la coordinación o soporte técnico de tu institución educativa.</p>
      `,
      footerNote:
        'Notificación automática de seguridad del Sistema de Identidad y Acceso (IAM) de ASAIE ÉXODO.',
    });

    return this.sendTransactionalEmail(
      {
        to: payload.recipientEmail,
        subject: 'Alerta de seguridad: Cambio de contraseña — ASAIE ÉXODO',
        html,
      },
      'PASSWORD_CHANGED_ALERT',
    );
  }

  public async sendCrmOmnichannelNotification(
    payload: CrmEmailNotificationPayload,
  ): Promise<MailDeliveryResult> {
    const html = this.buildInstitutionalLayout({
      badge: `CRM ESCOLAR — ${payload.schoolName}`,
      title: payload.subject,
      bodyHtml: `
        <p>Estimado(a) <strong>${payload.recipientFullName}</strong>,</p>
        <div style="padding:16px; background:#f8fafc; border-left:4px solid #1e40af; border-radius:4px; margin:16px 0;">
          ${payload.messageBody}
        </div>
      `,
      footerNote: `Mensaje enviado a través del CRM Escolar Omnicanal de ${payload.schoolName}.`,
    });

    return this.sendTransactionalEmail(
      {
        to: payload.recipientEmail,
        subject: `[${payload.schoolName}] ${payload.subject}`,
        html,
      },
      'CRM_OMNICHANNEL',
    );
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
             <a href="${params.ctaUrl}" style="background:#1e40af; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:600; display:inline-block;">
               ${params.ctaLabel}
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
