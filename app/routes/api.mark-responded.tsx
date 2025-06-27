import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import db from "../db.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { token } = await request.json();

    if (!token) {
      return json({ error: "Token obrigatório" }, { status: 400 });
    }

    // Buscar e atualizar convite
    const invitation = await db.reviewInvitation.findUnique({
      where: { token }
    });

    if (!invitation) {
      return json({ error: "Convite não encontrado" }, { status: 404 });
    }

    // Marcar como respondido
    await db.reviewInvitation.update({
      where: { token },
      data: { 
        responded: true,
        clicked: true,
        updatedAt: new Date()
      }
    });

    return json({ success: true, message: "Convite marcado como respondido" });

  } catch (error) {
    console.error("Erro ao marcar convite como respondido:", error);
    return json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function loader() {
  return json({ error: "Method not allowed" }, { status: 405 });
} 