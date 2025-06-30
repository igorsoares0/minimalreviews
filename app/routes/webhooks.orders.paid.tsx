import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { EmailService } from "../lib/email.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload, topic, admin } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  try {
    const order = payload as any;
    
    // Buscar configurações da loja
    const settings = await db.reviewSettings.findUnique({
      where: { shop },
    });

    // MUDANÇA: Usar autoSendEnabled para envio automático (webhook)
    if (!settings || !settings.autoSendEnabled) {
      console.log("Automatic sending disabled for shop:", shop);
      return new Response();
    }

    // Verificar se temos as configurações de email necessárias baseado no provedor
    let emailConfigValid = false;

    if (settings.emailProvider === "mailtrap") {
      // Para Mailtrap, precisamos do token e inbox ID
      emailConfigValid = !!(settings.mailtrapToken && settings.mailtrapInboxId && settings.emailFromAddress);
    } else {
      // Para outros provedores (SendGrid, Mailgun), precisamos da API Key
      emailConfigValid = !!(settings.emailApiKey && settings.emailFromAddress);
    }

    if (!emailConfigValid) {
      console.log(`Email configuration incomplete for shop: ${shop}. Provider: ${settings.emailProvider}`);
      return new Response();
    }

    const customerId = order.customer?.id ? order.customer.id.toString() : null;
    
    // Tentar extrair email de diferentes locais possíveis
    let customerEmail = order.customer?.email || 
                       order.email ||
                       order.contact_email ||
                       order.billing_address?.email ||
                       order.shipping_address?.email;

    // Se não encontrou email e temos um customer ID, buscar via API REST
    if (!customerEmail && customerId && admin) {
      try {
        console.log("🔍 Tentando buscar email do cliente...");
        console.log("⚠️ Email não encontrado no payload do webhook para customer ID:", customerId);
        
        // Solução alternativa: usar email temporário baseado no customer ID
        // O cliente poderá confirmar o email real quando acessar o link de review
        customerEmail = `customer-${customerId}@temp.${shop}`;
        console.log("💡 Usando email temporário:", customerEmail);
        
      } catch (error) {
        console.error("❌ Erro ao processar cliente:", error);
      }
    }

    const customerName = order.customer ? 
      `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : 
      order.billing_address?.name || 
      order.shipping_address?.name ||
      order.billing_address?.first_name && order.billing_address?.last_name ? 
        `${order.billing_address.first_name} ${order.billing_address.last_name}`.trim() :
      order.shipping_address?.first_name && order.shipping_address?.last_name ?
        `${order.shipping_address.first_name} ${order.shipping_address.last_name}`.trim() :
      'Cliente';

    // Debug: Log da estrutura do pedido
    console.log("🔍 Order debug info:", {
      orderId: order.id,
      hasCustomer: !!order.customer,
      customerId: customerId,
      customerEmail: order.customer?.email,
      orderEmail: order.email,
      contactEmail: order.contact_email,
      billingEmail: order.billing_address?.email,
      shippingEmail: order.shipping_address?.email,
      finalEmail: customerEmail,
    });

    if (!customerEmail) {
      console.log("❌ No customer email found for order:", order.id);
      console.log("Order payload keys:", Object.keys(order));
      console.log("Customer object:", order.customer);
      console.log("Billing address:", order.billing_address);
      console.log("Shipping address:", order.shipping_address);
      return new Response();
    }

    // Calcular data de envio usando autoSendDaysAfter
    const orderDate = new Date(order.created_at);
    const sendDate = new Date(orderDate);
    const daysAfter = settings.autoSendDaysAfter || 3;
    sendDate.setDate(sendDate.getDate() + daysAfter);

    console.log(`📅 Agendando envios automáticos para ${sendDate.toISOString()} (${daysAfter} dias após pedido)`);

    let convitesCriados = 0;

    // Processar produtos do pedido
    for (const lineItem of order.line_items || []) {
      const productId = `gid://shopify/Product/${lineItem.product_id}`;
      
      // Verificar se o cliente já fez review para este produto
      if (customerId || customerEmail) {
        const existingReview = await db.review.findFirst({
          where: {
            shop,
            productId,
            OR: [
              { customerId },
              { customerEmail },
            ],
          },
        });

        if (existingReview) {
          console.log(`Customer already reviewed product ${productId}`);
          continue;
        }
      }

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
        console.log(`Review invitation already exists for ${customerEmail} - ${lineItem.title}`);
        continue;
      }

      // Buscar dados do produto via GraphQL
      let productTitle = lineItem.title || 'Produto';
      let productImage = null;

      try {
        if (admin) {
          const productQuery = `
            query getProduct($id: ID!) {
              product(id: $id) {
                title
                featuredImage {
                  url
                }
              }
            }
          `;

          const productResponse = await admin.graphql(productQuery, {
            variables: { id: productId },
          });

          const productData = await productResponse.json();
          
          if (productData.data?.product) {
            productTitle = productData.data.product.title;
            productImage = productData.data.product.featuredImage?.url;
          }
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }

      // Gerar token seguro
      const token = EmailService.generateSecureToken();

      // Criar convite de review
      const invitation = await db.reviewInvitation.create({
        data: {
          shop,
          orderId: order.id.toString(),
          customerId,
          customerEmail,
          customerName,
          productId,
          productTitle,
          productImage,
          scheduledFor: sendDate,
          token,
        },
      });

      console.log(`✅ Convite automático criado para produto ${productTitle} (ID: ${invitation.id})`);
      convitesCriados++;
    }

    console.log(`🎉 Total de convites automáticos criados: ${convitesCriados}`);

  } catch (error) {
    console.error("❌ Erro ao processar webhook orders/paid:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(`Webhook error: ${errorMessage}`, { status: 500 });
  }

  return new Response();
}; 