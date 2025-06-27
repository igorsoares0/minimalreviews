import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  InlineStack,
  DataTable,
  EmptyState,
  Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { ClientOnly } from "../components/ClientOnly";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  // Buscar reviews recentes
  const reviews = await db.review.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Estatísticas básicas
  const totalReviews = await db.review.count({ where: { shop } });
  const pendingReviews = await db.review.count({ 
    where: { shop, published: false } 
  });
  
  const averageRating = await db.review.aggregate({
    where: { shop, published: true },
    _avg: { rating: true },
  });

  // Buscar configurações
  let settings = await db.reviewSettings.findUnique({
    where: { shop },
  });

  // Criar configurações padrão se não existirem
  if (!settings) {
    settings = await db.reviewSettings.create({
      data: { shop },
    });
  }

  return json({
    reviews,
    stats: {
      total: totalReviews,
      pending: pendingReviews,
      averageRating: averageRating._avg.rating || 0,
    },
    settings,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "toggle_review") {
    const reviewId = formData.get("reviewId") as string;
    const published = formData.get("published") === "true";
    
    await db.review.update({
      where: { id: reviewId },
      data: { published: !published },
    });
  }

  return json({ success: true });
};

export default function Index() {
  const { reviews, stats, settings } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const toggleReview = (reviewId: string, published: boolean) => {
    fetcher.submit(
      { action: "toggle_review", reviewId, published: published.toString() },
      { method: "POST" }
    );
  };

  const reviewRows = reviews.map((review) => [
    review.customerName || "Cliente Anônimo",
    "★".repeat(review.rating) + "☆".repeat(5 - review.rating),
    review.title || review.content?.substring(0, 50) + "..." || "",
    new Date(review.createdAt).toLocaleDateString("pt-BR"),
    <Text key={review.id} as="span" tone={review.published ? "success" : "caution"}>
      {review.published ? "Publicado" : "Pendente"}
    </Text>,
    <ClientOnly key={`btn-${review.id}`} fallback={<span>...</span>}>
      <Button
        size="micro"
        onClick={() => toggleReview(review.id, review.published)}
      >
        {review.published ? "Ocultar" : "Publicar"}
      </Button>
    </ClientOnly>,
  ]);

  return (
    <Page>
      <TitleBar title="Minimal Reviews - Dashboard" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              {/* Estatísticas */}
            <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Estatísticas
                  </Text>
                  <InlineStack gap="600">
                    <Box>
                      <Text as="p" variant="headingLg" tone="success">
                        {stats.total}
                      </Text>
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Total de Reviews
                      </Text>
                    </Box>
                    <Box>
                      <Text as="p" variant="headingLg" tone="caution">
                        {stats.pending}
                      </Text>
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Aguardando Aprovação
                      </Text>
                    </Box>
                    <Box>
                      <Text as="p" variant="headingLg">
                        {stats.averageRating.toFixed(1)}
                      </Text>
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Avaliação Média
                  </Text>
                    </Box>
                  </InlineStack>
                </BlockStack>
              </Card>

              {/* Lista de Reviews */}
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Reviews Recentes
                  </Text>
                  {reviews.length > 0 ? (
                    <ClientOnly fallback={<span>Carregando tabela...</span>}>
                      <DataTable
                        columnContentTypes={["text", "text", "text", "text", "text", "text"]}
                        headings={["Cliente", "Avaliação", "Comentário", "Data", "Status", "Ações"]}
                        rows={reviewRows}
                      />
                    </ClientOnly>
                  ) : (
                    <EmptyState
                      heading="Nenhum review ainda"
                      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                    >
                      <p>Seus primeiros reviews aparecerão aqui quando os clientes começarem a avaliar seus produtos.</p>
                    </EmptyState>
                )}
              </BlockStack>
            </Card>
            </BlockStack>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Configurações Rápidas
                  </Text>
                  <BlockStack gap="200">
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Auto-publicar reviews
                      </Text>
                      <Text as="span" tone={settings.autoPublish ? "success" : "critical"}>
                        {settings.autoPublish ? "Ativo" : "Inativo"}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Reviews anônimos
                      </Text>
                      <Text as="span" tone={settings.allowAnonymous ? "success" : "critical"}>
                        {settings.allowAnonymous ? "Permitido" : "Bloqueado"}
                      </Text>
                    </InlineStack>
                  </BlockStack>
                  <ClientOnly fallback={<span>Carregando...</span>}>
                    <Button url="/app/settings" variant="primary">
                      Configurar App
                    </Button>
                  </ClientOnly>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Primeiros Passos
                  </Text>
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd">
                      1. Configure as preferências do app
                    </Text>
                    <Text as="p" variant="bodyMd">
                      2. Ative a extensão na sua loja
                    </Text>
                    <Text as="p" variant="bodyMd">
                      3. Comece a receber reviews dos clientes
                    </Text>
                  </BlockStack>
                  <ClientOnly fallback={<span>Carregando...</span>}>
                    <Button url="/app/help" variant="plain">
                      Ver Tutorial Completo
                    </Button>
                  </ClientOnly>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
