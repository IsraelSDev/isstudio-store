import { sendRedeemCodeEmail } from "./email";
import {
  confirmPaymentAndIssueCode,
  markEmailSent,
  type Order,
} from "./orders";

/**
 * Confirma o pagamento, emite o código de resgate e dispara o e-mail.
 *
 * Chamada tanto pelo webhook do Asaas quanto pelo polling de status do Pix
 * (necessário em localhost, onde o webhook não chega). A emissão do código é
 * idempotente, então executar as duas vezes não gera código novo nem e-mail
 * duplicado: `code` só vem preenchido na primeira confirmação.
 */
export async function deliverPaidOrder(input: {
  paymentId: string;
  externalReference?: string | null;
  subscriptionId?: string | null;
}): Promise<{ order: Order; code: string | null } | null> {
  const result = await confirmPaymentAndIssueCode(input);
  if (!result) {
    console.warn(
      "[delivery] pagamento confirmado sem pedido correspondente:",
      input.paymentId,
      input.externalReference,
    );
    return null;
  }

  const { order, code } = result;
  if (!code) return result;

  const sent = await sendRedeemCodeEmail({
    to: order.customer_email,
    customerName: order.customer_name,
    orderRef: order.order_ref,
    code,
    items: order.items,
  });

  if (sent) {
    try {
      await markEmailSent(order.id);
    } catch (e) {
      console.warn("[delivery] markEmailSent", e);
    }
  }

  return result;
}
