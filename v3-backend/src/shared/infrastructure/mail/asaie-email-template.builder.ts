/**
 * Tokens visuales oficiales de marca ASAIE ÉXODO V3 sincronizados con
 * `v3-frontend/src/assets/scss/styles.scss`, `variables/_variables.scss` y `page-auth.scss`.
 */
export const ASAIE_EMAIL_BRAND_TOKENS = {
  // Gradiente hero oficial (.auth-shell / .auth-hero)
  heroStart: '#032344',
  heroMid: '#053f74',
  heroEnd: '#0277bd',
  // Colores primarios y de acento de marca
  primary: '#053f74',
  secondary: '#0399de',
  accentCyan: '#02aeec',
  heroSubtext: '#dbeafe',
  // Superficies y bordes (.auth-card / body)
  canvasBg: '#f6f7f9',
  cardBg: '#ffffff',
  softSurface: '#f8fafc',
  softBrandTint: '#eef6ff',
  border: '#e2e8f0',
  borderSubtle: '#eceef2',
  // Tipografia
  textPrimary: '#0f172a',
  textHeading: '#3a4252',
  textBody: '#334155',
  textMuted: '#64748b',
  // Estados semanticos
  success: '#10b981',
  successBg: '#ecfdf5',
  successText: '#065f46',
  warning: '#f59e0b',
  warningBg: '#fffbeb',
  warningText: '#92400e',
  danger: '#ef4444',
  dangerBg: '#fef2f2',
  dangerText: '#991b1b',
  // Fuente oficial
  fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  siteUrl: 'https://asaie.co',
} as const;

export const ASAIE_BRAND_LOGO_CID = 'asaie-brand-logo';

export type EmailBadgeTone = 'brand' | 'success' | 'warning' | 'danger';

export interface InstitutionalEmailLayoutInput {
  readonly preheader: string;
  readonly badge: string;
  readonly badgeTone?: EmailBadgeTone;
  readonly title: string;
  readonly subtitle?: string;
  readonly bodyHtml: string;
  readonly ctaLabel?: string;
  readonly ctaUrl?: string;
  readonly showFallbackUrl?: boolean;
  readonly calloutHtml?: string;
  readonly calloutTone?: EmailBadgeTone;
  readonly footerNote: string;
  readonly logoSrc: string | null;
  readonly siteUrl?: string;
}

/**
 * Constructor de plantillas HTML transaccionales alineadas con el sistema de diseño
 * ASAIE ÉXODO V3 (compatible con Gmail, Outlook Web/Desktop, Apple Mail y clientes móviles).
 */
export class AsaieEmailTemplateBuilder {
  public escapeHtml(value: string): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  public formatColombiaDateTime(isoOrText: string): string {
    const parsed = new Date(isoOrText);
    if (Number.isNaN(parsed.getTime())) {
      return this.escapeHtml(isoOrText);
    }
    const formatted = new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'America/Bogota',
    }).format(parsed);
    return this.escapeHtml(`${formatted} (COT)`);
  }

  public buildLayout(input: InstitutionalEmailLayoutInput): string {
    const t = ASAIE_EMAIL_BRAND_TOKENS;
    const year = new Date().getFullYear();
    const safeSiteUrl = this.escapeHtml(input.siteUrl || t.siteUrl);
    const safePreheader = this.escapeHtml(input.preheader);
    const toneStyles = this.resolveToneStyles(input.badgeTone ?? 'brand');

    // Placa blanca oficial (.auth-logo-plaque) con logotipo PNG inline CID o texto tipografico de marca
    const logoContent = input.logoSrc
      ? `<img src="${this.escapeHtml(input.logoSrc)}" alt="ASAIE ÉXODO" height="32" style="display:block; height:32px; width:auto; border:0; outline:none; text-decoration:none;" />`
      : `<span style="font-size:18px; font-weight:800; letter-spacing:0.6px; color:${t.secondary};">ASAIE</span><span style="font-size:14px; font-weight:800; letter-spacing:1.2px; color:${t.primary}; margin-left:5px;">ÉXODO</span>`;

    const subtitleHtml = input.subtitle
      ? `<p style="margin:6px 0 0; font-size:14px; line-height:1.5; color:${t.textMuted};">${input.subtitle}</p>`
      : '';

    const calloutBlock = input.calloutHtml
      ? this.renderCallout(input.calloutHtml, input.calloutTone ?? 'brand')
      : '';

    const ctaBlock =
      input.ctaLabel && input.ctaUrl
        ? this.renderCtaButton(input.ctaLabel, input.ctaUrl)
        : '';

    const fallbackUrlBlock =
      input.showFallbackUrl && input.ctaUrl
        ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0 0; background-color:${t.softSurface}; border:1px solid ${t.border}; border-radius:12px;">
             <tr>
               <td style="padding:14px 16px;">
                 <p style="margin:0 0 6px; font-size:12px; font-weight:600; color:${t.textMuted};">
                   ¿Problemas con el botón? Copia y pega este enlace en tu navegador:
                 </p>
                 <a href="${this.escapeHtml(input.ctaUrl)}" style="font-size:12px; line-height:1.5; color:${t.secondary}; text-decoration:underline; word-break:break-all; font-family:${t.fontFamily};">
                   ${this.escapeHtml(input.ctaUrl)}
                 </a>
               </td>
             </tr>
           </table>`
        : '';

    return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>${this.escapeHtml(input.title)} — ASAIE ÉXODO</title>
</head>
<body style="margin:0; padding:0; background-color:${t.canvasBg}; font-family:${t.fontFamily}; color:${t.textBody}; -webkit-font-smoothing:antialiased;">
  <!-- Texto de vista previa oculto en bandeja de entrada -->
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:${t.canvasBg};">
    ${safePreheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${t.canvasBg}; width:100%;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <!-- Contenedor principal tipo .auth-card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%; max-width:600px; background-color:${t.cardBg}; border:1px solid ${t.border}; border-radius:20px; overflow:hidden; box-shadow:0 20px 48px -20px rgba(3,35,68,0.16);">
          <!-- Barra superior hero con gradiente institucional ASAIE ÉXODO -->
          <tr>
            <td style="background-color:${t.primary}; background-image:linear-gradient(140deg, ${t.heroStart} 0%, ${t.heroMid} 52%, ${t.heroEnd} 100%); padding:24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff; border-radius:14px; box-shadow:0 8px 20px -8px rgba(3,35,68,0.45);">
                      <tr>
                        <td style="padding:7px 14px;">
                          <a href="${safeSiteUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none; display:inline-block;">
                            ${logoContent}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle" style="padding-left:12px;">
                    <span style="display:inline-block; padding:6px 12px; border-radius:999px; background-color:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); font-size:11px; font-weight:600; color:#ffffff; letter-spacing:0.2px; white-space:nowrap;">
                      <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background-color:${t.success}; margin-right:6px; vertical-align:middle;"></span>
                      Comunidad Educativa
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Línea de acento cian de marca -->
          <tr>
            <td style="height:4px; line-height:4px; font-size:4px; background-color:${t.secondary}; background-image:linear-gradient(90deg, ${t.primary} 0%, ${t.secondary} 55%, ${t.accentCyan} 100%);">
              &nbsp;
            </td>
          </tr>

          <!-- Cuerpo principal de la tarjeta -->
          <tr>
            <td style="padding:32px 32px 28px;">
              <!-- Eyebrow pill (.auth-eyebrow) -->
              <div style="margin:0 0 14px;">
                <span style="display:inline-block; padding:5px 12px; border-radius:999px; background-color:${toneStyles.bg}; color:${toneStyles.accent}; font-size:11px; font-weight:700; letter-spacing:0.6px; text-transform:uppercase; border:1px solid ${toneStyles.border};">
                  ${input.badge}
                </span>
              </div>

              <!-- Título principal -->
              <h1 style="margin:0; font-size:22px; line-height:1.3; font-weight:700; letter-spacing:-0.3px; color:${t.textPrimary};">
                ${input.title}
              </h1>
              ${subtitleHtml}

              <!-- Contenido narrativo -->
              <div style="margin:20px 0 0; font-size:15px; line-height:1.65; color:${t.textBody};">
                ${input.bodyHtml}
              </div>

              ${calloutBlock}
              ${ctaBlock}
              ${fallbackUrlBlock}
            </td>
          </tr>

          <!-- Pie institucional limpio -->
          <tr>
            <td style="background-color:${t.softSurface}; border-top:1px solid ${t.borderSubtle}; padding:20px 32px;">
              <p style="margin:0 0 12px; font-size:12.5px; line-height:1.55; color:${t.textMuted};">
                ${input.footerNote}
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" style="font-size:11.5px; color:${t.textMuted};">
                    © ${year} <strong style="color:${t.primary};">ASAIE ÉXODO</strong> · Plataforma Académica y Administrativa
                  </td>
                  <td align="right" style="font-size:11.5px;">
                    <a href="${safeSiteUrl}" target="_blank" rel="noopener noreferrer" style="color:${t.secondary}; font-weight:600; text-decoration:none;">
                      asaie.co
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private renderCtaButton(label: string, url: string): string {
    const t = ASAIE_EMAIL_BRAND_TOKENS;
    const safeUrl = this.escapeHtml(url);
    const safeLabel = this.escapeHtml(label);

    return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0 6px;">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td align="center" style="border-radius:12px; background-color:${t.primary}; background-image:linear-gradient(135deg, ${t.primary} 0%, ${t.secondary} 100%); box-shadow:0 12px 24px -10px rgba(2,174,236,0.75);">
                <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:14px 32px; font-family:${t.fontFamily}; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:12px; letter-spacing:0.15px;">
                  ${safeLabel}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
  }

  private renderCallout(contentHtml: string, tone: EmailBadgeTone): string {
    const styles = this.resolveToneStyles(tone);
    return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:18px 0; background-color:${styles.bg}; border:1px solid ${styles.border}; border-left:4px solid ${styles.accent}; border-radius:8px;">
      <tr>
        <td style="padding:14px 16px; font-size:14px; line-height:1.6; color:${styles.text};">
          ${contentHtml}
        </td>
      </tr>
    </table>`;
  }

  private resolveToneStyles(tone: EmailBadgeTone): {
    bg: string;
    accent: string;
    border: string;
    text: string;
  } {
    const t = ASAIE_EMAIL_BRAND_TOKENS;
    switch (tone) {
      case 'success':
        return {
          bg: t.successBg,
          accent: t.success,
          border: '#a7f3d0',
          text: t.successText,
        };
      case 'warning':
        return {
          bg: t.warningBg,
          accent: t.warning,
          border: '#fde68a',
          text: t.warningText,
        };
      case 'danger':
        return {
          bg: t.dangerBg,
          accent: t.danger,
          border: '#fecaca',
          text: t.dangerText,
        };
      case 'brand':
      default:
        return {
          bg: t.softBrandTint,
          accent: t.secondary,
          border: '#bfdbfe',
          text: t.primary,
        };
    }
  }
}
