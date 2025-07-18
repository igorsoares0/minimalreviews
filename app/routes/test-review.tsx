import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import db from "../db.server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    // Buscar configurações para obter a URL da API externa
    const baseUrl = process.env.RWS_BASE_URL || "https://rws-three.vercel.app";

    // Criar um convite de teste
    const testToken = "test-token-" + Date.now();
    
    const invitation = await db.reviewInvitation.create({
      data: {
        shop,
        orderId: "test-order-123",
        customerId: "test-customer-456",
        customerEmail: "teste@exemplo.com",
        customerName: "Cliente Teste",
        productId: "test-product-789",
        productTitle: "Produto de Teste",
        productImage: null,
        scheduledFor: new Date(),
        token: testToken
      }
    });

    const reviewUrl = `${baseUrl}/review/${testToken}`;

    return json({
      message: "Convite de teste criado!",
      info: "O link abaixo aponta para sua aplicação Next.js, não para o app Shopify",
      token: testToken,
      reviewUrl,
      rwsBaseUrl: baseUrl,
      invitation: {
        shop: invitation.shop,
        customerEmail: invitation.customerEmail,
        productTitle: invitation.productTitle,
        token: invitation.token
      },
      instructions: [
        "1. Configure a URL da API externa em /app/settings",
        "2. Certifique-se que sua aplicação Next.js está rodando em localhost:3000",
        "3. Implemente a rota /review/[token] no seu Next.js",
        "4. O cliente preencherá a review no seu Next.js",
        "5. O app Shopify consumirá as reviews via /apps/minimalreviews/api/reviews"
      ]
    });

  } catch (error) {
    console.error("Erro ao criar convite de teste:", error);
    return json({ error: "Erro ao criar convite de teste" }, { status: 500 });
  }
}; 