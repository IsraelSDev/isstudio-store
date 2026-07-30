import { Resend } from "resend";
import { absoluteUrl, siteConfig } from "./seo";
import { formatPrice } from "./catalog";
import { formatRedeemCode } from "./redeem-code";
import type { OrderItem } from "./orders";

function apiKey(): string {
  return (process.env.RESEND_API_KEY || "").trim();
}

function fromAddress(): string {
  return (
    process.env.RESEND_FROM || "ISStudio Store <no-reply@isstudio.com.br>"
  ).trim();
}

export function isEmailConfigured(): boolean {
  return !!apiKey();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(input: {
  customerName: string;
  orderRef: string;
  code: string;
  items: OrderItem[];
  redeemUrl: string;
}): string {
  const { customerName, orderRef, code, items, redeemUrl } = input;

  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #1e1e2b;color:#d5d5e0;font-size:14px">
          ${escapeHtml(item.name)}
          <span style="color:#75758c"> × ${item.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #1e1e2b;color:#d5d5e0;font-size:14px;text-align:right">
          ${escapeHtml(formatPrice(item.price * item.quantity))}
        </td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:32px 16px;background:#050508;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto">
      <tr>
        <td style="padding-bottom:24px">
          <span style="color:#a08bff;font-size:13px;font-weight:600;letter-spacing:.16em;text-transform:uppercase">ISStudio Store</span>
        </td>
      </tr>
      <tr>
        <td style="background:#0c0c14;border:1px solid #1e1e2b;border-radius:20px;padding:32px">
          <h1 style="margin:0 0 12px;color:#fff;font-size:22px;font-weight:600">Pagamento confirmado</h1>
          <p style="margin:0 0 24px;color:#9a9aad;font-size:15px;line-height:1.6">
            Obrigado, ${escapeHtml(customerName)}. Seu pedido
            <strong style="color:#d5d5e0">${escapeHtml(orderRef)}</strong>
            está liberado. Use o código abaixo para baixar o código-fonte.
          </p>

          <div style="background:#12121d;border:1px solid #2a2a3d;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px">
            <p style="margin:0 0 10px;color:#75758c;font-size:12px;letter-spacing:.12em;text-transform:uppercase">Seu código de resgate</p>
            <p style="margin:0;color:#fff;font-size:30px;font-weight:700;letter-spacing:.14em;font-family:ui-monospace,SFMono-Regular,Menlo,monospace">
              ${escapeHtml(formatRedeemCode(code))}
            </p>
          </div>

          <a href="${redeemUrl}" style="display:block;background:#7048f5;color:#fff;text-decoration:none;text-align:center;padding:15px;border-radius:12px;font-size:15px;font-weight:600;margin-bottom:28px">
            Resgatar meus produtos
          </a>

          <p style="margin:0 0 8px;color:#75758c;font-size:12px;letter-spacing:.12em;text-transform:uppercase">Itens do pedido</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>

          <p style="margin:24px 0 0;color:#75758c;font-size:13px;line-height:1.6">
            Guarde este e-mail: o código não expira e pode ser usado quantas vezes você precisar
            para baixar novamente os arquivos. Não compartilhe com terceiros.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-top:24px;text-align:center;color:#5a5a6e;font-size:12px;line-height:1.6">
          ${escapeHtml(siteConfig.name)}<br />
          Dúvidas? Responda este e-mail.
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildText(input: {
  customerName: string;
  orderRef: string;
  code: string;
  items: OrderItem[];
  redeemUrl: string;
}): string {
  const list = input.items
    .map(
      (item) =>
        `- ${item.name} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`,
    )
    .join("\n");

  return `Pagamento confirmado — ISStudio Store

Obrigado, ${input.customerName}.
Pedido: ${input.orderRef}

SEU CÓDIGO DE RESGATE: ${formatRedeemCode(input.code)}

Resgate em: ${input.redeemUrl}

Itens:
${list}

Guarde este e-mail. O código não expira e pode ser reutilizado para baixar os arquivos novamente.
Não compartilhe o código com terceiros.
`;
}

/**
 * Envia o código de resgate. Nunca lança: o webhook de pagamento precisa
 * responder 200 mesmo que o e-mail falhe, senão o Asaas fica reentregando o
 * evento. O código continua acessível pela tela de sucesso do checkout.
 */
export async function sendRedeemCodeEmail(input: {
  to: string;
  customerName: string;
  orderRef: string;
  code: string;
  items: OrderItem[];
}): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn(
      "[email] RESEND_API_KEY ausente — código de resgate não enviado para",
      input.to,
    );
    return false;
  }

  const redeemUrl = absoluteUrl("/resgatar");
  const payload = { ...input, redeemUrl };

  try {
    const resend = new Resend(apiKey());
    const { error } = await resend.emails.send({
      from: fromAddress(),
      to: input.to,
      subject: `Seu código de resgate — pedido ${input.orderRef}`,
      html: buildHtml(payload),
      text: buildText(payload),
    });

    if (error) {
      console.error("[email] Resend recusou o envio:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] falha ao enviar código de resgate:", e);
    return false;
  }
}
