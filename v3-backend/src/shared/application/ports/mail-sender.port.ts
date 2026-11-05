export interface SendTransactionalEmailInput {
  readonly to: string;
  readonly subject: string;
  readonly html: string;
  readonly text?: string;
}

export interface EmailConfirmationPayload {
  readonly recipientEmail: string;
  readonly recipientFullName: string;
  readonly schoolName?: string;
  readonly confirmationToken: string;
  readonly confirmationUrl: string;
}

export interface PasswordResetEmailPayload {
  readonly recipientEmail: string;
  readonly recipientFullName: string;
  readonly resetToken: string;
  readonly resetUrl: string;
  readonly expiresInMinutes: number;
}

export interface PasswordChangedAlertPayload {
  readonly recipientEmail: string;
  readonly recipientFullName: string;
  readonly changedAtIso: string;
}

export interface CrmEmailNotificationPayload {
  readonly recipientEmail: string;
  readonly recipientFullName: string;
  readonly schoolName: string;
  readonly subject: string;
  readonly messageBody: string;
}

export interface MailDeliveryResult {
  readonly delivered: boolean;
  readonly messageId: string;
  readonly provider: string;
  readonly recipientEmail: string;
  readonly templateType:
    | 'EMAIL_CONFIRMATION'
    | 'PASSWORD_RESET'
    | 'PASSWORD_CHANGED_ALERT'
    | 'CRM_OMNICHANNEL'
    | 'CUSTOM';
}

export abstract class MailSenderPort {
  abstract sendTransactionalEmail(
    input: SendTransactionalEmailInput,
    templateType?: MailDeliveryResult['templateType'],
  ): Promise<MailDeliveryResult>;

  abstract sendEmailConfirmation(
    payload: EmailConfirmationPayload,
  ): Promise<MailDeliveryResult>;

  abstract sendPasswordResetEmail(
    payload: PasswordResetEmailPayload,
  ): Promise<MailDeliveryResult>;

  abstract sendPasswordChangedAlert(
    payload: PasswordChangedAlertPayload,
  ): Promise<MailDeliveryResult>;

  abstract sendCrmOmnichannelNotification(
    payload: CrmEmailNotificationPayload,
  ): Promise<MailDeliveryResult>;
}
