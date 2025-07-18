import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import db from "../db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  
  if (!shop) {
    return json({ error: "Shop parameter required" }, { status: 400 });
  }

  try {
    const config = {
      rwsBaseUrl: process.env.RWS_BASE_URL || "https://rws-three.vercel.app"
    };

    return json(config);
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return json({ 
      rwsBaseUrl: process.env.RWS_BASE_URL || "https://rws-three.vercel.app"
    });
  }
} 