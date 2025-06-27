import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import db from "../db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const productIdParam = url.searchParams.get("productId");
  const shop = url.searchParams.get("shop");
  
  if (!shop) {
    return json({ error: "Shop parameter required" }, { status: 400 });
  }

  try {
    // Processar productId - aceitar tanto com gid:// quanto sem
    const productIdNumeric = productIdParam?.replace("gid://shopify/Product/", "");
    const productIdVariants = productIdParam
      ? ([productIdParam, productIdNumeric].filter(Boolean) as string[])
      : [];

    // Buscar configurações para template
    const settings = await db.reviewSettings.findUnique({
      where: { shop },
    });
    const template = (settings as any)?.reviewTemplate || "classic";
    
    // Buscar reviews do banco de dados local
    const reviews = await db.review.findMany({
      where: {
        shop,
        ...(productIdVariants.length > 0 ? { productId: { in: productIdVariants } } : {}),
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
        verified: true,
      },
      take: 50, // Limite padrão
    });
    
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
        ratingDistribution
      }
    });

  } catch (error) {
    console.error("💥 Erro ao buscar reviews:", error);
    
    // Retornar dados vazios em caso de erro
    return json({
      reviews: [],
      template: "classic",
      stats: {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      },
      error: "Erro ao carregar reviews"
    });
  }
} 