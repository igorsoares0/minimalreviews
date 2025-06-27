import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import db from "../db.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { shop, productId } = await request.json();

    if (!shop) {
      return json({ error: "Shop obrigatório" }, { status: 400 });
    }

    // Criar algumas reviews de teste
    const testReviews = [
      {
        shop,
        productId: productId || "test-product-123",
        customerName: "João Silva",
        customerEmail: "joao@teste.com",
        rating: 5,
        title: "Produto excelente!",
        content: "Superou minhas expectativas. Qualidade incrível e entrega rápida.",
        published: true,
        verified: true,
        helpful: 3,
      },
      {
        shop,
        productId: productId || "test-product-123", 
        customerName: "Maria Santos",
        customerEmail: "maria@teste.com",
        rating: 4,
        title: "Muito bom",
        content: "Produto de boa qualidade, recomendo. Apenas o prazo de entrega poderia ser menor.",
        published: true,
        verified: false,
        helpful: 1,
      },
      {
        shop,
        productId: productId || "test-product-123",
        customerName: "Pedro Oliveira", 
        customerEmail: "pedro@teste.com",
        rating: 5,
        title: "Perfeito!",
        content: "Exatamente como descrito. Muito satisfeito com a compra.",
        published: true,
        verified: true,
        helpful: 2,
      }
    ];

    const createdReviews = [];
    
    for (const reviewData of testReviews) {
      // Verificar se já existe uma review deste cliente para este produto
      const existingReview = await db.review.findFirst({
        where: {
          shop: reviewData.shop,
          productId: reviewData.productId,
          customerEmail: reviewData.customerEmail,
        },
      });

      if (!existingReview) {
        const review = await db.review.create({
          data: reviewData,
        });
        createdReviews.push(review);
      }
    }

    return json({
      success: true,
      message: `${createdReviews.length} reviews de teste criadas`,
      reviews: createdReviews,
    });

  } catch (error) {
    console.error("💥 Erro ao criar reviews de teste:", error);
    return json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function loader() {
  return json({ error: "Method not allowed" }, { status: 405 });
} 