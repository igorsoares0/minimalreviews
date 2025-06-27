import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import {
  Card,
  Page,
  Layout,
  FormLayout,
  TextField,
  Select,
  Button,
  Banner,
  Text,
  BlockStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { ClientOnly } from "../components/ClientOnly";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  
  // Buscar produtos para o select
  const productsResponse = await admin.graphql(`
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }
  `, {
    variables: { first: 50 }
  });

  const productsData = await productsResponse.json();
  const products = productsData.data.products.edges.map((edge: any) => ({
    label: edge.node.title,
    value: edge.node.id // Mantém GID completo para corresponder ao storefront
  }));

  return json({ products, shop: session.shop });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const productId = formData.get("productId") as string;
  const customerName = formData.get("customerName") as string;
  const customerEmail = formData.get("customerEmail") as string;
  const rating = parseInt(formData.get("rating") as string);
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const verified = formData.get("verified") === "true";
  const published = formData.get("published") === "true";
  const mediaUrlsRaw = (formData.get("mediaUrls") as string | null)?.trim() || "";
  const mediaUrlsArr = mediaUrlsRaw
    ? mediaUrlsRaw.split(/\n|,/) // separa por nova linha ou vírgula
        .map((u) => u.trim())
        .filter(Boolean)
        .slice(0, 5)
    : [];

  // Validações
  if (!productId || !customerName || !customerEmail || !rating || !title || !content) {
    return json({ error: "Todos os campos obrigatórios devem ser preenchidos" }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return json({ error: "A avaliação deve ser entre 1 e 5 estrelas" }, { status: 400 });
  }

  try {
    const review = await db.review.create({
      data: {
        shop: session.shop,
        productId,
        customerName,
        customerEmail,
        rating,
        title,
        content,
        verified,
        published,
        helpful: 0,
        // @ts-ignore - campo novo mediaUrls ainda não no client
        mediaUrls: mediaUrlsArr.length ? mediaUrlsArr : undefined,
      },
    });

    return json({ success: true, review });
  } catch (error) {
    console.error("Erro ao criar review:", error);
    return json({ error: "Erro interno do servidor" }, { status: 500 });
  }
};

export default function AddReview() {
  const { products } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const ratingOptions = [
    { label: "1 Estrela", value: "1" },
    { label: "2 Estrelas", value: "2" },
    { label: "3 Estrelas", value: "3" },
    { label: "4 Estrelas", value: "4" },
    { label: "5 Estrelas", value: "5" },
  ];

  const [formState, setFormState] = useState({
    productId: "",
    customerName: "",
    customerEmail: "",
    rating: "",
    title: "",
    content: "",
    verified: "false",
    published: "true",
    mediaUrls: "",
  });

  const handleChange = (field: keyof typeof formState) => (value: string) =>
    setFormState((prev) => ({ ...prev, [field]: value }));

  return (
    <Page
      title="Adicionar Review Manual"
      subtitle="Insira reviews manualmente para testes"
      backAction={{ content: "Reviews", url: "/app/reviews" }}
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
                <p>Review criado com sucesso!</p>
              </Banner>
            </ClientOnly>
          )}

          <Card>
            <Form method="post">
              <FormLayout>
                <Select
                  label="Produto"
                  options={[
                    { label: "Selecione um produto", value: "" },
                    ...products,
                  ]}
                  name="productId"
                  value={formState.productId}
                  onChange={handleChange("productId")}
                />

                <TextField
                  label="Nome do Cliente"
                  name="customerName"
                  value={formState.customerName}
                  onChange={handleChange("customerName")}
                  autoComplete="name"
                />

                <TextField
                  label="Email do Cliente"
                  name="customerEmail"
                  type="email"
                  value={formState.customerEmail}
                  onChange={handleChange("customerEmail")}
                  autoComplete="email"
                />

                <Select
                  label="Avaliação"
                  options={[
                    { label: "Selecione uma avaliação", value: "" },
                    ...ratingOptions,
                  ]}
                  name="rating"
                  value={formState.rating}
                  onChange={handleChange("rating")}
                />

                <TextField
                  label="Título do Review"
                  name="title"
                  value={formState.title}
                  onChange={handleChange("title")}
                  placeholder="Ex: Produto excelente!"
                  autoComplete="off"
                />

                <TextField
                  label="Comentário"
                  name="content"
                  value={formState.content}
                  onChange={handleChange("content")}
                  multiline={4}
                  placeholder="Escreva o comentário do cliente..."
                  autoComplete="off"
                />

                <TextField
                  label="Fotos/Vídeos (URLs — um por linha)"
                  name="mediaUrls"
                  value={formState.mediaUrls ?? ""}
                  onChange={handleChange("mediaUrls" as any)}
                  multiline={4}
                  helpText="Cole URLs de imagens ou vídeos hospedados (máx. 5)."
                  autoComplete="off"
                />

                <FormLayout.Group>
                  <Select
                    label="Review Verificado"
                    options={[
                      { label: "Não", value: "false" },
                      { label: "Sim", value: "true" },
                    ]}
                    name="verified"
                    value={formState.verified}
                    onChange={handleChange("verified")}
                  />

                  <Select
                    label="Status"
                    options={[
                      { label: "Rascunho", value: "false" },
                      { label: "Publicado", value: "true" },
                    ]}
                    name="published"
                    value={formState.published}
                    onChange={handleChange("published")}
                  />
                </FormLayout.Group>

                <ClientOnly fallback={<span>Carregando...</span>}>
                  <Button
                    submit
                    variant="primary"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Criando..." : "Criar Review"}
                  </Button>
                </ClientOnly>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h3">
                Dicas para Reviews de Teste
              </Text>
              
              <Text as="p">
                • Use nomes e emails realistas para simular clientes reais
              </Text>
              
              <Text as="p">
                • Varie as avaliações (1-5 estrelas) para testar diferentes cenários
              </Text>
              
              <Text as="p">
                • Teste reviews verificados e não verificados
              </Text>
              
              <Text as="p">
                • Crie reviews publicados e em rascunho para testar a moderação
              </Text>
              
              <Text as="p">
                • Use títulos e comentários variados para testar a exibição
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 