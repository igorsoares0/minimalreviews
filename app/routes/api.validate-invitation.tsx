import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import db from "../db.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { token, productId } = await request.json();

    if (!token) {
      return json({ valid: false, error: "Token obrigatório" }, { status: 400 });
    }

    // Buscar convite pelo token
    const invitation = await db.reviewInvitation.findUnique({
      where: { token }
    });

    if (!invitation) {
      return json({ valid: false, error: "Convite não encontrado" }, { status: 404 });
    }

    // Verificar se já foi respondido
    if (invitation.responded) {
      return json({ valid: false, error: "Este convite já foi utilizado" }, { status: 400 });
    }

    // Verificar se não expirou (opcional - 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (invitation.createdAt < thirtyDaysAgo) {
      return json({ valid: false, error: "Este convite expirou" }, { status: 400 });
    }

    return json({
      valid: true,
      invitation: {
        id: invitation.id,
        productTitle: invitation.productTitle,
        productImage: invitation.productImage,
        customerName: invitation.customerName,
        customerEmail: invitation.customerEmail,
        shop: invitation.shop,
        productId: invitation.productId,
      }
    });

  } catch (error) {
    console.error("Erro ao validar convite:", error);
    return json({ valid: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function loader() {
  return json({ error: "Method not allowed" }, { status: 405 });
} 