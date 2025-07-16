import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import db from "../db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const startTime = Date.now();
  const url = new URL(request.url);
  
  console.log("🔧 DEBUG ENDPOINT CALLED");
  console.log("📍 Request URL:", request.url);
  console.log("🕐 Timestamp:", new Date().toISOString());
  
  const shop = url.searchParams.get("shop") || "test-shop";
  const productId = url.searchParams.get("productId") || "test-product";
  
  const results = {
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method,
    environment: process.env.NODE_ENV,
    shop,
    productId,
    headers: Object.fromEntries(request.headers.entries()),
    queryParams: Object.fromEntries(url.searchParams),
    database: null as any,
    reviews: null as any,
    settings: null as any,
    errors: [] as string[]
  };

  // Test environment variables
  console.log("🔧 Environment Check:");
  console.log("- NODE_ENV:", process.env.NODE_ENV);
  console.log("- DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Missing");
  console.log("- SHOPIFY_API_KEY:", process.env.SHOPIFY_API_KEY ? "✅ Set" : "❌ Missing");

  // Test database connection
  try {
    console.log("💾 Testing database connection...");
    
    // Test basic connection
    const sessionCount = await db.session.count();
    console.log("📊 Sessions in DB:", sessionCount);
    
    // Test reviews table
    const totalReviews = await db.review.count();
    console.log("📊 Total reviews in DB:", totalReviews);
    
    // Test review settings
    const settingsCount = await db.reviewSettings.count();
    console.log("📊 Review settings in DB:", settingsCount);
    
    // Test reviews for specific shop
    const shopReviews = await db.review.count({ where: { shop } });
    console.log(`📊 Reviews for shop ${shop}:`, shopReviews);
    
    // Test published vs unpublished
    const publishedReviews = await db.review.count({ where: { shop, published: true } });
    const unpublishedReviews = await db.review.count({ where: { shop, published: false } });
    console.log(`📊 Published reviews for ${shop}:`, publishedReviews);
    console.log(`📊 Unpublished reviews for ${shop}:`, unpublishedReviews);
    
    results.database = {
      connected: true,
      sessionCount,
      totalReviews,
      settingsCount,
      shopReviews,
      publishedReviews,
      unpublishedReviews
    };
    
    // Test specific product query
    if (productId !== "test-product") {
      const productIdNumeric = productId.replace("gid://shopify/Product/", "");
      const productIdVariants = [productId, productIdNumeric].filter(Boolean);
      
      console.log("🔍 Testing product-specific query...");
      console.log("🆔 Product ID variants:", productIdVariants);
      
      const productReviews = await db.review.findMany({
        where: {
          shop,
          productId: { in: productIdVariants },
          published: true,
        },
        select: {
          id: true,
          productId: true,
          customerName: true,
          rating: true,
          title: true,
          content: true,
          published: true,
          createdAt: true,
        },
        take: 5
      });
      
      console.log(`📊 Reviews for product ${productId}:`, productReviews.length);
      
      results.reviews = {
        productIdVariants,
        found: productReviews.length,
        samples: productReviews
      };
    }
    
    // Test settings for shop
    const shopSettings = await db.reviewSettings.findUnique({
      where: { shop }
    });
    
    console.log("⚙️ Settings for shop:", !!shopSettings);
    
    results.settings = shopSettings ? {
      exists: true,
      id: shopSettings.id,
      shop: shopSettings.shop,
      autoPublish: shopSettings.autoPublish,
      reviewTemplate: (shopSettings as any)?.reviewTemplate,
      showOnProductPage: shopSettings.showOnProductPage
    } : { exists: false };
    
  } catch (error) {
    console.error("💥 Database test failed:", error);
    results.database = {
      connected: false,
      error: error.message,
      stack: error.stack
    };
    results.errors.push(`Database error: ${error.message}`);
  }
  
  // Test sample queries that the app proxy uses
  try {
    console.log("🧪 Testing app proxy query pattern...");
    
    const testQuery = await db.review.findMany({
      where: {
        shop,
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
      take: 5
    });
    
    console.log("🧪 Test query successful, found:", testQuery.length, "reviews");
    
    results.testQuery = {
      success: true,
      count: testQuery.length,
      samples: testQuery.map(r => ({
        id: r.id,
        customerName: r.customerName,
        rating: r.rating,
        hasTitle: !!r.title,
        hasContent: !!r.content,
        createdAt: r.createdAt
      }))
    };
    
  } catch (error) {
    console.error("💥 Test query failed:", error);
    results.errors.push(`Test query error: ${error.message}`);
  }

  const processingTime = Date.now() - startTime;
  console.log(`✅ Debug endpoint completed in ${processingTime}ms`);
  
  return json({
    ...results,
    processingTime: `${processingTime}ms`,
    success: results.errors.length === 0
  });
}