import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import db from "../db.server";
import { EmailService } from "../lib/email.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    console.log('🧪 Webhook de teste recebido');
    
    const payload = await request.json();
    const shop = "lojatesteigor.myshopify.com"; // Shop fixo para teste
    
    console.log(`Processando pedido de teste para ${shop}`);

    // Buscar configurações da loja
    const settings = await db.reviewSettings.findUnique({
      where: { shop },
    });

    if (!settings) {
      console.log("⚠️ Configurações não encontradas para shop:", shop);
      return json({ 
        success: false, 
        message: "Configurações não encontradas. Configure o app primeiro." 
      });
    }

    const order = payload;
    const customerId = order.customer?.id ? order.customer.id.toString() : null;
    const customerEmail = order.customer?.email;
    const customerName = order.customer ? 
      `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : 
      'Cliente';

    if (!customerEmail) {
      console.log("❌ Nenhum email de cliente encontrado");
      return json({ 
        success: false, 
        message: "Email do cliente não encontrado" 
      });
    }

    let convitesCriados = 0;

    // Processar produtos do pedido
    for (const lineItem of order.line_items || []) {
      const productId = `gid://shopify/Product/${lineItem.product_id}`;
      
      // Verificar se já existe um convite pendente
      const existingInvitation = await db.reviewInvitation.findFirst({
        where: {
          shop,
          customerEmail,
          productId,
          responded: false,
        },
      });

      if (existingInvitation) {
        console.log(`⚠️ Convite já existe para ${customerEmail} - ${lineItem.title}`);
        continue;
      }

      // Gerar token seguro
      const token = EmailService.generateSecureToken();
      
      // Calcular data de envio (imediato para teste)
      const scheduledFor = new Date();

      // Criar convite de review
      await db.reviewInvitation.create({
        data: {
          shop,
          orderId: order.id.toString(),
          customerId,
          customerEmail,
          customerName,
          productId,
          productTitle: lineItem.title,
          productImage: null,
          scheduledFor,
          token,
        },
      });

      console.log(`✅ Convite criado para ${customerEmail} - ${lineItem.title}`);
      convitesCriados++;
    }

    return json({ 
      success: true, 
      message: `${convitesCriados} convite(s) criado(s) com sucesso!`,
      shop,
      customerEmail,
      convitesCriados
    });

  } catch (error) {
    console.error("❌ Erro ao processar webhook de teste:", error);
    return json({ 
      success: false, 
      message: `Erro: ${error}` 
    }, { status: 500 });
  }
}; 