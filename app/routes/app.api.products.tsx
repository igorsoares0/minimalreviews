import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  
  const url = new URL(request.url);
  const query = url.searchParams.get("query") || "";
  const limit = parseInt(url.searchParams.get("limit") || "50");

  try {
    const response = await admin.graphql(
      `#graphql
        query getProducts($first: Int!, $query: String) {
          products(first: $first, query: $query) {
            edges {
              node {
                id
                title
                handle
                featuredImage {
                  url
                  altText
                }
                status
                createdAt
                updatedAt
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }`,
      {
        variables: {
          first: limit,
          query: query,
        },
      }
    );

    const data = await response.json() as any;
    
    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      return json({ error: "Erro ao buscar produtos" }, { status: 500 });
    }

    const products = data.data?.products?.edges?.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      featuredImage: edge.node.featuredImage,
      status: edge.node.status,
      createdAt: edge.node.createdAt,
      updatedAt: edge.node.updatedAt,
    })) || [];

    return json({
      products,
      hasNextPage: data.data?.products?.pageInfo?.hasNextPage || false,
      hasPreviousPage: data.data?.products?.pageInfo?.hasPreviousPage || false,
    });

  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return json({ error: "Erro interno do servidor" }, { status: 500 });
  }
} 