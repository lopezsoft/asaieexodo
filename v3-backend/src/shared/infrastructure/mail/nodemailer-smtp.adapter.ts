import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import type { Attachment } from 'nodemailer/lib/mailer';
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
import {
  ASAIE_BRAND_LOGO_CID,
  ASAIE_EMAIL_BRAND_TOKENS,
  AsaieEmailTemplateBuilder,
} from './asaie-email-template.builder';

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
  private readonly siteUrl: string;
  private readonly brandLogoUrl: string | null;
  private readonly brandLogoLocalPath: string | null;
  private readonly isTestEnvironment: boolean;
  private readonly isProduction: boolean;
  private readonly templateBuilder: AsaieEmailTemplateBuilder;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: SmartLoggerService,
  ) {
    this.templateBuilder = new AsaieEmailTemplateBuilder();
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
    this.siteUrl = this.configService
      .get<string>('SITE_URL', ASAIE_EMAIL_BRAND_TOKENS.siteUrl)
      .trim();

    const configuredLogoUrl = this.configService
      .get<string>('MAIL_BRAND_LOGO_URL', '')
      .trim();
    this.brandLogoUrl =
      configuredLogoUrl && /^https:\/\//i.test(configuredLogoUrl)
        ? configuredLogoUrl
        : null;

    const candidateLogoPath = resolve(
      join(process.cwd(), 'resources', 'mail', 'logotipo.png'),
    );
    this.brandLogoLocalPath = existsSync(candidateLogoPath)
      ? candidateLogoPath
      : null;

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
    const attachments = this.resolveInlineBrandAttachments(input.html);

    try {
      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromAddress}>`,
        to: safeTo,
        subject: safeSubject,
        html: input.html,
        text: input.text,
        attachments,
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
    const safeName = this.templateBuilder.escapeHtml(payload.recipientFullName);
    const safeSchool = this.templateBuilder.escapeHtml(
      payload.schoolName ?? 'ASAIE ÉXODO',
    );
    const safeUrl = this.validateSafeHttpUrl(payload.confirmationUrl);

    const html = this.templateBuilder.buildLayout({
      preheader: `Confirma tu dirección de correo para activar tu acceso en ${payload.schoolName ?? 'ASAIE ÉXODO'}.`,
      badge: 'Verificación de Cuenta',
      badgeTone: 'brand',
      title: `¡Te damos la bienvenida, ${safeName}!`,
      subtitle: `Portal unificado de ${safeSchool}`,
      bodyHtml: `
        <p style="margin:0 0 14px;">Tu cuenta en <strong>${safeSchool}</strong> a través de <strong>ASAIE ÉXODO</strong> está casi lista.</p>
        <p style="margin:0;">Confirma tu dirección de correo electrónico para activar las notificaciones académicas, boletines y alertas del CRM Escolar:</p>
      `,
      ctaLabel: 'Confirmar Correo Electrónico',
      ctaUrl: safeUrl,
      showFallbackUrl: true,
      footerNote:
        'Si no solicitaste esta verificación, puedes ignorar este mensaje de forma segura; tu dirección no será activada sin confirmación.',
      logoSrc: this.resolveBrandLogoSrc(),
      siteUrl: this.siteUrl,
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
    const safeName = this.templateBuilder.escapeHtml(payload.recipientFullName);
    const safeUrl = this.validateSafeHttpUrl(payload.resetUrl);
    const safeMinutes = Math.max(1, Math.floor(payload.expiresInMinutes));

    const html = this.templateBuilder.buildLayout({
      preheader: `Enlace seguro de un solo uso para restablecer tu contraseña en ASAIE ÉXODO (válido por ${safeMinutes} minutos).`,
      badge: 'Recuperación de Contraseña',
      badgeTone: 'brand',
      title: 'Restablece tu contraseña',
      subtitle: `Solicitud de acceso para ${safeName}`,
      bodyHtml: `
        <p style="margin:0 0 14px;">Hola <strong>${safeName}</strong>,</p>
        <p style="margin:0;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>ASAIE ÉXODO</strong>. Haz clic en el siguiente botón para crear una nueva contraseña segura:</p>
      `,
      calloutTone: 'brand',
      calloutHtml: `<strong>Enlace temporal de un solo uso:</strong> por tu seguridad, este enlace caducará automáticamente en <strong>${safeMinutes} minutos</strong>.`,
      ctaLabel: 'Restablecer Mi Contraseña',
      ctaUrl: safeUrl,
      showFallbackUrl: true,
      footerNote:
        'Si tú no realizaste esta solicitud, tu contraseña actual permanece protegida y no necesitas realizar ninguna acción.',
      logoSrc: this.resolveBrandLogoSrc(),
      siteUrl: this.siteUrl,
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
    const safeName = this.templateBuilder.escapeHtml(payload.recipientFullName);
    const formattedDate = this.templateBuilder.formatColombiaDateTime(
      payload.changedAtIso,
    );

    const html = this.templateBuilder.buildLayout({
      preheader: 'Tu contraseña en ASAIE ÉXODO fue actualizada exitosamente y tus sesiones previas fueron cerradas.',
      badge: 'Alerta de Seguridad',
      badgeTone: 'success',
      title: 'Tu contraseña ha sido actualizada',
      subtitle: `Confirmación de seguridad para ${safeName}`,
      bodyHtml: `
        <p style="margin:0 0 14px;">Hola <strong>${safeName}</strong>,</p>
        <p style="margin:0;">Te confirmamos que la contraseña de tu cuenta en <strong>ASAIE ÉXODO</strong> fue modificada exitosamente y tus sesiones anteriores fueron cerradas para proteger tu acceso.</p>
      `,
      calloutTone: 'success',
      calloutHtml: `<strong>Fecha y hora del cambio:</strong> ${formattedDate}<br />Si reconoces esta actividad, no necesitas realizar ninguna acción adicional. Si no fuiste tú, comunícate de inmediato con la coordinación o soporte técnico de tu Institución Educativa.`,
      footerNote:
        'Notificación automática del Sistema de Identidad y Acceso (IAM) de ASAIE ÉXODO.',
      logoSrc: this.resolveBrandLogoSrc(),
      siteUrl: this.siteUrl,
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
    const safeSchool = this.templateBuilder.escapeHtml(payload.schoolName);
    const safeSubject = this.templateBuilder.escapeHtml(payload.subject);
    const safeName = this.templateBuilder.escapeHtml(payload.recipientFullName);
    const safeBodyHtml = this.templateBuilder
      .escapeHtml(payload.messageBody)
      .replace(/\r?\n/g, '<br />');

    const html = this.templateBuilder.buildLayout({
      preheader: `${payload.schoolName}: ${payload.subject}`,
      badge: `CRM Escolar · ${safeSchool}`,
      badgeTone: 'brand',
      title: safeSubject,
      subtitle: `Comunicación oficial de ${safeSchool}`,
      bodyHtml: `
        <p style="margin:0;">Estimado(a) <strong>${safeName}</strong>,</p>
      `,
      calloutTone: 'brand',
      calloutHtml: safeBodyHtml,
      footerNote: `Mensaje institucional enviado a través del CRM Escolar Omnicanal de ${safeSchool}.`,
      logoSrc: this.resolveBrandLogoSrc(),
      siteUrl: this.siteUrl,
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

  private resolveBrandLogoSrc(): string | null {
    if (this.brandLogoUrl) {
      return this.brandLogoUrl;
    }
    if (this.brandLogoLocalPath) {
      return `cid:${ASAIE_BRAND_LOGO_CID}`;
    }
    return null;
  }

  private resolveInlineBrandAttachments(html: string): Attachment[] | undefined {
    if (
      this.brandLogoUrl ||
      !this.brandLogoLocalPath ||
      !html.includes(`cid:${ASAIE_BRAND_LOGO_CID}`)
    ) {
      return undefined;
    }

    return [
      {
        filename: 'asaie-logotipo.png',
        path: this.brandLogoLocalPath,
        cid: ASAIE_BRAND_LOGO_CID,
        contentDisposition: 'inline',
        contentType: 'image/png',
      },
    ];
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
}
