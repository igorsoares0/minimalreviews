import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import db from "../db.server";

/**
 * Este endpoint serve para manter o banco de dados ativo
 * Ele faz uma consulta simples que não consome muitos recursos
 * mas mantém a conexão com o banco de dados ativa
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Fazer uma consulta simples para manter o banco de dados ativo
    const count = await db.reviewSettings.count();
    
    return json({ success: true, timestamp: new Date().toISOString(), count });
  } catch (error) {
    console.error("Erro no keep-alive:", error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
