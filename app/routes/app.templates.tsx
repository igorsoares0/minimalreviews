import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import {
  Card,
  Page,
  Layout,
  Button,
  Banner,
  Text,
  BlockStack,
  InlineStack,
  Box,
  Divider,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { ClientOnly } from "../components/ClientOnly";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  // Buscar configurações atuais
  const settings = await db.reviewSettings.findUnique({
    where: { shop: session.shop },
  });

  return json({ 
    settings: settings || { reviewTemplate: "classic" },
    shop: session.shop 
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const template = formData.get("template") as string;

  if (!["classic", "modern", "minimal"].includes(template)) {
    return json({ error: "Template inválido" }, { status: 400 });
  }

  try {
    await db.reviewSettings.upsert({
      where: { shop: session.shop },
      update: { reviewTemplate: template } as any,
      create: {
        shop: session.shop,
        reviewTemplate: template,
      } as any,
    });

    return json({ success: true, template });
  } catch (error) {
    console.error("Erro ao salvar template:", error);
    return json({ error: "Erro interno do servidor" }, { status: 500 });
  }
};

const templates = [
  {
    id: "classic",
    name: "Clássico",
    description: "Layout tradicional com estrelas, nome e comentário",
    preview: `
      <div style="border: 1px solid #e1e3e5; border-radius: 8px; padding: 16px; background: white;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="color: #FFD700; font-size: 16px;">★★★★★</span>
          <strong style="color: #202223;">João Silva</strong>
        </div>
        <div style="font-weight: 600; margin-bottom: 8px; color: #202223;">
          Produto excelente!
        </div>
        <div style="color: #6D7175; line-height: 1.4; margin-bottom: 12px;">
          Muito satisfeito com a compra. Qualidade excepcional e entrega rápida.
        </div>
        <div style="display: flex; gap: 6px;">
          <img src="https://via.placeholder.com/60x60" style="width: 60px; height: 60px; border-radius: 4px; object-fit: cover;" />
          <img src="https://via.placeholder.com/60x60" style="width: 60px; height: 60px; border-radius: 4px; object-fit: cover;" />
        </div>
        <div style="color: #8C9196; font-size: 12px; margin-top: 8px;">
          20 de junho de 2025
        </div>
      </div>
    `
  },
  {
    id: "modern",
    name: "Moderno",
    description: "Design clean com destaque visual e sombras",
    preview: `
      <div style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div>
            <div style="color: #FFD700; font-size: 18px; margin-bottom: 4px;">★★★★★</div>
            <div style="font-weight: 700; color: #1a1a1a; font-size: 16px;">João Silva</div>
          </div>
          <div style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 16px; font-size: 11px; font-weight: 600;">
            VERIFICADO
          </div>
        </div>
        <h4 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 18px;">
          Produto excelente!
        </h4>
        <p style="color: #555; line-height: 1.5; margin-bottom: 16px;">
          Muito satisfeito com a compra. Qualidade excepcional e entrega rápida.
        </p>
        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          <img src="https://via.placeholder.com/80x80" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
          <img src="https://via.placeholder.com/80x80" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
        </div>
        <div style="color: #888; font-size: 13px;">
          20 de junho de 2025
        </div>
      </div>
    `
  },
  {
    id: "minimal",
    name: "Minimalista",
    description: "Layout simples e limpo com foco no conteúdo",
    preview: `
      <div style="border-left: 4px solid #FFD700; padding-left: 16px; margin: 16px 0;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
          <span style="color: #FFD700;">★★★★★</span>
          <span style="color: #333; font-weight: 500;">João Silva</span>
          <span style="color: #999; font-size: 12px;">20/06/2025</span>
        </div>
        <div style="color: #333; font-weight: 600; margin-bottom: 6px;">
          Produto excelente!
        </div>
        <div style="color: #666; line-height: 1.4; margin-bottom: 12px;">
          Muito satisfeito com a compra. Qualidade excepcional e entrega rápida.
        </div>
        <div style="display: flex; gap: 4px;">
          <img src="https://via.placeholder.com/50x50" style="width: 50px; height: 50px; border-radius: 4px; object-fit: cover;" />
          <img src="https://via.placeholder.com/50x50" style="width: 50px; height: 50px; border-radius: 4px; object-fit: cover;" />
        </div>
      </div>
    `
  }
];

export default function Templates() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [selectedTemplate, setSelectedTemplate] = useState((settings as any).reviewTemplate || "classic");

  return (
    <Page
      title="Templates de Review"
      subtitle="Escolha como as reviews serão exibidas no seu tema"
      backAction={{ content: "Configurações", url: "/app/settings" }}
    >
      <Layout>
        <Layout.Section>
          {actionData && "error" in actionData && (
            <ClientOnly>
              <Banner tone="critical" title="Erro">
                <p>{actionData.error}</p>
              </Banner>
            </ClientOnly>
          )}
          
          {actionData && "success" in actionData && actionData.success && (
            <ClientOnly>
              <Banner tone="success" title="Sucesso">
                <p>Template salvo com sucesso!</p>
              </Banner>
            </ClientOnly>
          )}

          <BlockStack gap="500">
            {templates.map((template) => (
              <Card key={template.id}>
                <BlockStack gap="400">
                  <InlineStack align="space-between">
                    <BlockStack gap="200">
                      <Text variant="headingMd" as="h3">
                        {template.name}
                      </Text>
                      <Text variant="bodyMd" tone="subdued" as="p">
                        {template.description}
                      </Text>
                    </BlockStack>
                    <Button
                      variant={selectedTemplate === template.id ? "primary" : "secondary"}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      {selectedTemplate === template.id ? "Selecionado" : "Selecionar"}
                    </Button>
                  </InlineStack>
                  
                  <Divider />
                  
                  <Box>
                    <Text variant="headingSm" as="h4" tone="subdued">
                      Preview:
                    </Text>
                    <Box paddingBlockStart="300">
                      <div dangerouslySetInnerHTML={{ __html: template.preview }} />
                    </Box>
                  </Box>
                </BlockStack>
              </Card>
            ))}
          </BlockStack>

          <Card>
            <Form method="post">
              <input type="hidden" name="template" value={selectedTemplate} />
              <InlineStack align="end">
                <ClientOnly fallback={<span>Carregando...</span>}>
                  <Button
                    submit
                    variant="primary"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Salvando..." : "Salvar Template"}
                  </Button>
                </ClientOnly>
              </InlineStack>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 