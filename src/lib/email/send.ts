import { BRAND } from "@/lib/config/brand";
import { getSiteUrl } from "@/lib/config/site";

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

const FROM_EMAIL = process.env.EMAIL_FROM ?? `SolarFlow <${BRAND.supportEmail}>`;

export async function sendEmail({ to, subject, html, text }: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const recipients = Array.isArray(to) ? to : [to];

  if (!apiKey) {
    console.info("[email] RESEND_API_KEY no configurada. Mensaje omitido:", { to: recipients, subject });
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: recipients,
      subject,
      html,
      text: text ?? html.replace(/<[^>]+>/g, " "),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[email] Error al enviar:", res.status, body);
    return false;
  }

  return true;
}

export async function notifyContactInquiry(input: {
  nombre: string;
  email: string;
  empresa?: string | null;
  telefono?: string | null;
  mensaje: string;
}): Promise<void> {
  const adminEmail = process.env.CONTACT_NOTIFY_EMAIL?.trim() ?? BRAND.supportEmail;
  const adminUrl = `${getSiteUrl()}/admin/mensajes`;

  await sendEmail({
    to: adminEmail,
    subject: `[${BRAND.name}] Nueva consulta de ${input.nombre}`,
    html: `
      <h2>Nueva consulta desde la landing</h2>
      <p><strong>Nombre:</strong> ${escapeHtml(input.nombre)}</p>
      <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      ${input.empresa ? `<p><strong>Empresa:</strong> ${escapeHtml(input.empresa)}</p>` : ""}
      ${input.telefono ? `<p><strong>Teléfono:</strong> ${escapeHtml(input.telefono)}</p>` : ""}
      <p><strong>Mensaje:</strong></p>
      <p>${escapeHtml(input.mensaje).replace(/\n/g, "<br>")}</p>
      <p><a href="${adminUrl}">Ver en el panel de administración</a></p>
    `,
  });
}

export async function sendTeamInviteEmail(input: {
  to: string;
  empresaNombre: string;
  inviteUrl: string;
}): Promise<void> {
  await sendEmail({
    to: input.to,
    subject: `Invitación a unirte a ${input.empresaNombre} en ${BRAND.name}`,
    html: `
      <h2>Te han invitado a ${escapeHtml(input.empresaNombre)}</h2>
      <p>Has sido invitado a colaborar en el equipo de <strong>${escapeHtml(input.empresaNombre)}</strong> en ${BRAND.name}.</p>
      <p><a href="${input.inviteUrl}">Aceptar invitación</a></p>
      <p>El enlace caduca en 7 días. Si no esperabas este correo, puedes ignorarlo.</p>
    `,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
