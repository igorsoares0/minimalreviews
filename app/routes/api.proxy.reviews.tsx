import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import db from "../db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const startTime = Date.now();
  const url = new URL(request.url);
  
  console.log("🔍 APP PROXY ROUTE CALLED");
  console.log("📍 Request URL:", request.url);
  console.log("🕐 Timestamp:", new Date().toISOString());
  console.log("🌍 Environment:", process.env.NODE_ENV);
  console.log("🔑 All Query Params:", Object.fromEntries(url.searchParams));
  console.log("📋 Request Headers:", Object.fromEntries(request.headers.entries()));
  
  const productIdParam = url.searchParams.get("productId");
  const shop = url.searchParams.get("shop");
  
  console.log("📊 Extracted Parameters:");
  console.log("  - shop:", shop);
  console.log("  - productIdParam:", productIdParam);
  
  if (!shop) {
    console.log("❌ Missing shop parameter");
    return json({ error: "Shop parameter required" }, { status: 400 });
  }

  try {
    console.log("🔧 Processing product ID...");
    // Processar productId - aceitar tanto com gid:// quanto sem
    const productIdNumeric = productIdParam?.replace("gid://shopify/Product/", "");
    const productIdVariants = productIdParam
      ? ([productIdParam, productIdNumeric].filter(Boolean) as string[])
      : [];

    console.log("🆔 Product ID variants:", productIdVariants);

    console.log("💾 Checking database connection...");
    console.log("📡 DATABASE_URL exists:", !!process.env.DATABASE_URL);
    
    console.log("🔍 Fetching review settings...");
    // Buscar configurações para template
    const settings = await db.reviewSettings.findUnique({
      where: { shop },
    });
    console.log("⚙️ Settings found:", !!settings);
    console.log("🎨 Settings details:", settings ? {
      id: settings.id,
      shop: settings.shop,
      reviewTemplate: (settings as any)?.reviewTemplate
    } : null);
    
    const template = (settings as any)?.reviewTemplate || "classic";
    console.log("🎯 Using template:", template);
    
    console.log("📋 Querying reviews from database...");
    console.log("🔍 Query parameters:");
    console.log("  - shop:", shop);
    console.log("  - productIdVariants:", productIdVariants);
    console.log("  - published:", true);
    
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
    
    console.log("📊 Database query results:");
    console.log("  - Reviews found:", reviews.length);
    console.log("  - First review sample:", reviews[0] ? {
      id: reviews[0].id,
      customerName: reviews[0].customerName,
      rating: reviews[0].rating,
      createdAt: reviews[0].createdAt
    } : "No reviews");

    // Test: Also query ALL reviews for this shop to see if there are any
    const allShopReviews = await db.review.count({ where: { shop } });
    const allShopReviewsUnpublished = await db.review.count({ where: { shop, published: false } });
    console.log("📈 Shop review stats:");
    console.log("  - Total reviews in shop:", allShopReviews);
    console.log("  - Unpublished reviews:", allShopReviewsUnpublished);
    
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

    const responseData = {
      reviews,
      template,
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution
      }
    };

    console.log("✅ Success! Returning response:");
    console.log("📊 Response summary:", {
      reviewsCount: reviews.length,
      template,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      processingTime: `${Date.now() - startTime}ms`
    });

    return json(responseData);

  } catch (error) {
    console.error("💥 ERROR in app proxy route:");
    console.error("❌ Error message:", error.message);
    console.error("📋 Error stack:", error.stack);
    console.error("🕐 Error occurred at:", new Date().toISOString());
    console.error("⏱️ Processing time before error:", `${Date.now() - startTime}ms`);
    
    // Retornar dados vazios em caso de erro
    const errorResponse = {
      reviews: [],
      template: "classic",
      stats: {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      },
      error: "Erro ao carregar reviews",
      debugInfo: {
        message: error.message,
        timestamp: new Date().toISOString(),
        shop,
        productIdParam,
        environment: process.env.NODE_ENV
      }
    };
    
    console.log("📤 Returning error response:", errorResponse);
    return json(errorResponse, { status: 500 });
  }
} 