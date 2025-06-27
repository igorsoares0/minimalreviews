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

    if (!settings || !settings.sendEmailNotification) {
      console.log("Email notifications disabled for shop:", shop);
      return new Response();
    }

    // Verificar se temos as configurações de email necessárias
    if (!settings.emailApiKey || !settings.emailFromAddress) {
      console.log("Email configuration incomplete for shop:", shop);
      return new Response();
    }

    const customerId = order.customer?.id ? order.customer.id.toString() : null;
    const customerEmail = order.customer?.email;
    const customerName = order.customer ? 
      `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : 
      'Cliente';

    if (!customerEmail) {
      console.log("No customer email found for order:", order.id);
      return new Response();
    }

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
        console.log(`Review invitation already exists for ${customerEmail} - ${productId}`);
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
      
      // Calcular data de envio (3 dias após o pedido)
      const scheduledFor = new Date();
      scheduledFor.setDate(scheduledFor.getDate() + 3);

      // Criar convite de review
      await db.reviewInvitation.create({
        data: {
          shop,
          orderId: order.id.toString(),
          customerId,
          customerEmail,
          customerName,
          productId,
          productTitle,
          productImage,
          scheduledFor,
          token,
        },
      });

      console.log(`Review invitation created for ${customerEmail} - ${productTitle}`);
    }

    console.log('🔔 Webhook orders/paid recebido!', {
      orderId: order.id,
      customer: order.customer?.email,
      total: order.total_price
    });

  } catch (error) {
    console.error("Erro ao processar webhook orders/paid:", error);
  }

  return new Response();
}; 