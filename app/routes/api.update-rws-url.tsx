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

    if (!rwsUrl) {
      return json({ error: "URL do RWS obrigatória" }, { status: 400 });
    }

    console.log("🔧 Atualizando URL do RWS para shop:", shop, "URL:", rwsUrl);

    // Buscar ou criar configurações da loja
    const settings = await db.reviewSettings.upsert({
      where: { shop },
      update: {
        rwsBaseUrl: rwsUrl,
      },
      create: {
        shop,
        rwsBaseUrl: rwsUrl,
        autoPublish: true,
        requireApproval: false,
        allowAnonymous: true,
        sendEmailNotification: true,
        showOnProductPage: true,
        starColor: "#FFD700",
        maxReviewLength: 500,
        reviewTemplate: "classic",
        emailProvider: "sendgrid",
        emailFromName: "Sua Loja",
      },
    });

    console.log("✅ Configurações atualizadas:", settings);

    return json({
      success: true,
      message: `URL do RWS atualizada para: ${rwsUrl}`,
      settings: {
        shop: settings.shop,
        rwsBaseUrl: settings.rwsBaseUrl,
      }
    });

  } catch (error) {
    console.error("💥 Erro ao atualizar configurações:", error);
    return json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function loader() {
  return json({ error: "Method not allowed" }, { status: 405 });
} 