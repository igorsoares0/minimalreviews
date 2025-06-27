import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import db from "../db.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { shop } = await request.json();

    if (!shop) {
      return json({ error: "Shop obrigatório" }, { status: 400 });
    }

    // Buscar configurações da loja para obter URL do RWS
    const settings = await db.reviewSettings.findUnique({
      where: { shop }
    });

    const baseUrl = (settings as any)?.rwsBaseUrl || "http://localhost:3002";
    console.log("🧪 Testando conectividade com RWS:", baseUrl);

    // Testar conectividade básica
    const testUrl = `${baseUrl}/api/reviews`;
    console.log("📡 URL de teste:", testUrl);

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("📊 Status da resposta:", response.status);
    console.log("📋 Headers da resposta:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erro na resposta:", errorText);
      return json({
        success: false,
        error: `Erro ${response.status}: ${errorText}`,
        url: testUrl,
        status: response.status
      });
    }

    const data = await response.json();
    console.log("✅ Resposta recebida:", data.length, "reviews");

    return json({
      success: true,
      message: `RWS acessível! Encontradas ${data.length} reviews`,
      url: testUrl,
      status: response.status,
      reviewCount: data.length
    });

  } catch (error) {
    console.error("💥 Erro no teste:", error);
    
    let errorMessage = "Erro interno do servidor";
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        errorMessage = "ECONNREFUSED - RWS não está rodando ou não está acessível na porta configurada";
      } else if (error.message.includes("fetch failed")) {
        errorMessage = "Fetch failed - Falha na conexão com o RWS";
      } else {
        errorMessage = error.message;
      }
    }
    
    return json({ 
      success: false, 
      error: errorMessage,
      details: error instanceof Error ? error.stack : String(error)
    }, { status: 500 });
  }
}

export async function loader() {
  return json({ error: "Method not allowed" }, { status: 405 });
} 