import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const {
      shop,
      productId,
      customerId,
      customerName,
      customerEmail,
      rating,
      title,
      content,
      // @ts-ignore
      mediaUrls,
    } = body as any;

    // Validações básicas
    if (!shop || !productId || !rating) {
      return json(
        { error: "Campos obrigatórios: shop, productId, rating" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return json(
        { error: "Rating deve estar entre 1 e 5" },
        { status: 400 }
      );
    }

    // Buscar configurações da loja
    const settings = await db.reviewSettings.findUnique({
      where: { shop },
    });

    // Se não permitir reviews anônimos e não tiver dados do cliente
    if (settings && !settings.allowAnonymous && !customerId && !customerName) {
      return json(
        { error: "Reviews anônimos não são permitidos" },
        { status: 403 }
      );
    }

    // Verificar se o cliente já fez review para este produto
    const existingReview = await db.review.findFirst({
      where: {
        shop,
        productId,
        OR: [
          { customerId: customerId || undefined },
          { customerEmail: customerEmail || undefined },
        ],
      },
    });

    if (existingReview) {
      return json(
        { error: "Você já avaliou este produto" },
        { status: 409 }
      );
    }

    // Determinar se deve ser publicado automaticamente
    const published = settings?.autoPublish && !settings?.requireApproval;

    // Criar o review
    const review = await db.review.create({
      data: {
        shop,
        productId,
        customerId,
        customerName,
        customerEmail,
        rating,
        title,
        content,
        published,
        // @ts-ignore campo novo
        mediaUrls,
      },
    });

    return json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        published: review.published,
      },
    });
  } catch (error) {
    console.error("Erro ao criar review:", error);
    return json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
};

export const loader = async ({ request }: any) => {
  const startTime = Date.now();
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const productIdParam = url.searchParams.get("productId");

  console.log("🔍 INTERNAL API REVIEWS ROUTE CALLED");
  console.log("📍 Request URL:", request.url);
  console.log("🕐 Timestamp:", new Date().toISOString());
  console.log("🌍 Environment:", process.env.NODE_ENV);
  console.log("🔑 Query Params:", Object.fromEntries(url.searchParams));
  console.log("📋 Request Headers:", Object.fromEntries(request.headers.entries()));
  console.log("🔍 API Reviews - Parâmetros:", { shop, productIdParam });

  // Adicionar headers CORS para permitir acesso de qualquer origem
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Verificar se é uma requisição OPTIONS (preflight)
  if (request.method.toLowerCase() === "options") {
    return new Response(null, { 
      status: 204, 
      headers 
    });
  }

  if (!shop || !productIdParam) {
    return json({ error: "Parâmetros shop e productId são obrigatórios" }, { 
      status: 400,
      headers
    });
  }

  try {
    // Buscar configurações para template
    const settings = await db.reviewSettings.findUnique({
      where: { shop },
    });
    const template = (settings as any)?.reviewTemplate || "classic";

    // Normalizar o ID do produto para diferentes formatos possíveis
    const productIdNumeric = productIdParam?.replace("gid://shopify/Product/", "");
    const productIdWithPrefix = productIdNumeric ? `gid://shopify/Product/${productIdNumeric}` : null;
    
    // Criar array com todas as variantes possíveis do ID
    const productIdVariants = [
      productIdParam,
      productIdNumeric,
      productIdWithPrefix
    ].filter(Boolean) as string[];
    
    console.log("🔢 IDs de produto normalizados:", productIdVariants);

    // Buscar reviews com tratamento de erro melhorado
    let reviews = [];
    try {
      reviews = await db.review.findMany({
        where: {
          shop,
          productId: { in: productIdVariants },
          published: true,
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          customerName: true,
          rating: true,
          title: true,
          content: true,
          createdAt: true,
          mediaUrls: true,
        },
      });
    } catch (dbError) {
      console.error("Erro ao buscar reviews do banco:", dbError);
      // Retornar dados vazios em caso de erro do banco
      reviews = [];
    }

    console.log(`📊 Encontradas ${reviews.length} reviews para o produto`);

    // Calcular estatísticas
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    return json({
      reviews,
      template,
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      },
    }, { headers });
  } catch (error) {
    console.error("Erro ao buscar reviews:", error);
    // Retornar resposta de erro mais informativa
    return json({ 
      error: "Erro interno do servidor",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { 
      status: 500,
      headers
    });
  }
}; 