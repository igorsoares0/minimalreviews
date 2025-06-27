import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import db from "../db.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { shop, rwsUrl } = await request.json();

    if (!shop) {
      return json({ error: "Shop obrigatório" }, { status: 400 });
    }

    console.log("🔍 Iniciando sincronização para shop:", shop);

    // Buscar configurações da loja para obter URL do RWS
    const settings = await db.reviewSettings.findUnique({
      where: { shop }
    });

    const baseUrl = rwsUrl || (settings as any)?.rwsBaseUrl || "http://localhost:3002";
    console.log("🌐 URL do RWS configurada:", baseUrl);

    // URL completa para buscar reviews
    const fullUrl = `${baseUrl}/api/reviews?shopifyShop=${encodeURIComponent(shop)}`;
    console.log("📡 Fazendo requisição para:", fullUrl);

    // Buscar reviews do RWS para esta loja
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("📊 Status da resposta:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erro na resposta:", errorText);
      throw new Error(`Erro ao buscar reviews: ${response.status} - ${errorText}`);
    }

    const rwsReviews = await response.json();
    console.log("📦 Reviews encontradas no RWS:", rwsReviews.length);

    let syncedCount = 0;
    let errorCount = 0;

    // Sincronizar cada review
    for (const rwsReview of rwsReviews) {
      try {
        console.log("🔄 Processando review:", rwsReview.id);
        
        // Garantir que o productId esteja no formato correto do Shopify
        const shopifyProductId = rwsReview.shopifyProductId.startsWith('gid://shopify/Product/') 
          ? rwsReview.shopifyProductId 
          : `gid://shopify/Product/${rwsReview.shopifyProductId}`;

        // Verificar se já existe uma review com o mesmo token ou dados únicos
        const existingReview = await db.review.findFirst({
          where: {
            shop,
            OR: [
              { productId: shopifyProductId },
              { productId: rwsReview.shopifyProductId }, // Verificar também formato antigo
            ],
            customerEmail: rwsReview.customerEmail,
            // Adicionar verificação por token se disponível
            ...(rwsReview.invitationToken && {
              OR: [
                { customerEmail: rwsReview.customerEmail },
                // Podemos adicionar um campo token no futuro se necessário
              ]
            })
          }
        });

        if (!existingReview) {
          // Garantir que o productId esteja no formato correto do Shopify
          const shopifyProductId = rwsReview.shopifyProductId.startsWith('gid://shopify/Product/') 
            ? rwsReview.shopifyProductId 
            : `gid://shopify/Product/${rwsReview.shopifyProductId}`;

          // Criar nova review no Minimal Reviews
          await db.review.create({
            data: {
              shop,
              productId: shopifyProductId,
              customerId: null,
              customerName: rwsReview.customerName,
              customerEmail: rwsReview.customerEmail,
              rating: rwsReview.rating,
              title: rwsReview.comment ? rwsReview.comment.substring(0, 100) : null,
              content: rwsReview.comment,
              verified: true, // Reviews do RWS são consideradas verificadas
              published: true,
              mediaUrls: rwsReview.media && rwsReview.media.length > 0 
                ? rwsReview.media.map((m: any) => {
                    // Se a URL for relativa, converter para URL absoluta do RWS
                    if (m.url.startsWith('/')) {
                      return `${baseUrl}${m.url}`;
                    }
                    return m.url;
                  })
                : undefined,
            }
          });

          console.log("✅ Review sincronizada:", rwsReview.id);
          syncedCount++;
        } else {
          console.log("⏭️ Review já existe, pulando:", rwsReview.id);
        }
      } catch (error) {
        console.error("❌ Erro ao sincronizar review:", rwsReview.id, error);
        errorCount++;
      }
    }

    console.log("🎉 Sincronização concluída:", { syncedCount, errorCount });

    return json({
      success: true,
      message: `Sincronização concluída: ${syncedCount} reviews sincronizadas, ${errorCount} erros`,
      syncedCount,
      errorCount
    });

  } catch (error) {
    console.error("💥 Erro na sincronização:", error);
    
    // Melhor tratamento de erro
    let errorMessage = "Erro interno do servidor";
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        errorMessage = "Não foi possível conectar ao servidor RWS. Verifique se está rodando na porta correta.";
      } else if (error.message.includes("fetch failed")) {
        errorMessage = "Falha na conexão com o servidor RWS. Verifique a URL e se o servidor está rodando.";
      } else {
        errorMessage = error.message;
      }
    }
    
    return json({ error: errorMessage }, { status: 500 });
  }
}

export async function loader() {
  return json({ error: "Method not allowed" }, { status: 405 });
} 