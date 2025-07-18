import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams, useActionData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  DataTable,
  EmptyState,

  TextField,
  Select,
  Modal,
  FormLayout,
  InlineStack,
  Pagination,
  Banner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { EmailService } from "../lib/email.server";
import { ClientOnly } from "../components/ClientOnly";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const url = new URL(request.url);
  
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 25;
  const skip = (page - 1) * limit;
  
  const status = url.searchParams.get("status");
  const rating = url.searchParams.get("rating");
  const search = url.searchParams.get("search");

  let where: any = { shop };
  
  if (status === "published") where.published = true;
  if (status === "pending") where.published = false;
  if (rating) where.rating = parseInt(rating);
  if (search) {
    where.OR = [
      { customerName: { contains: search } },
      { title: { contains: search } },
      { content: { contains: search } },
    ];
  }

  const [reviews, totalCount] = await Promise.all([
    db.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.review.count({ where }),
  ]);

  // Buscar informações dos produtos para as reviews
  const reviewsWithProductInfo = await Promise.all(
    reviews.map(async (review) => {
      let productInfo = null;
      
      if (review.productId && session) {
        try {
          const productQuery = `
            query getProduct($id: ID!) {
              product(id: $id) {
                title
                handle
                featuredImage {
                  url
                  altText
                }
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
              }
            }
          `;

          const { admin } = await authenticate.admin(request);
          const productResponse = await admin.graphql(productQuery, {
            variables: { id: review.productId },
          });

          const productData = await productResponse.json();
          
          if (productData.data?.product) {
            productInfo = {
              title: productData.data.product.title,
              handle: productData.data.product.handle,
              image: productData.data.product.featuredImage?.url || 
                     productData.data.product.images?.edges?.[0]?.node?.url,
              imageAlt: productData.data.product.featuredImage?.altText || 
                       productData.data.product.images?.edges?.[0]?.node?.altText,
            };
          } else {
            console.log(`⚠️ Produto não encontrado para ID: ${review.productId}`);
            // Tentar extrair ID numérico para debug
            const numericId = review.productId.replace('gid://shopify/Product/', '');
            productInfo = {
              title: `Produto ${numericId}`,
              handle: `produto-${numericId}`,
              image: null,
              imageAlt: null,
              notFound: true
            };
          }
        } catch (error) {
          console.error("Error fetching product data for review:", review.id, error);
        }
      }

      return {
        ...review,
        productInfo,
        source: review.mediaUrls && Array.isArray(review.mediaUrls) && review.mediaUrls.length > 0 ? 'RWS' : 'Shopify',
        isFromRWS: review.mediaUrls && Array.isArray(review.mediaUrls) && review.mediaUrls.length > 0,
        mediaUrls: review.mediaUrls ? (Array.isArray(review.mediaUrls) ? review.mediaUrls : []) : []
      };
    })
  );

  const totalPages = Math.ceil(totalCount / limit);

  return json({
    reviews: reviewsWithProductInfo,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
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

  if (action === "delete_review") {
    const reviewId = formData.get("reviewId") as string;
    
    await db.review.delete({
      where: { id: reviewId },
    });
  }

  if (action === "send_manual_invite") {
    const productId = formData.get("productId") as string;
    const customerName = formData.get("customerName") as string;
    const customerEmail = formData.get("customerEmail") as string;

    try {
      // Buscar configurações da loja
      const settings = await db.reviewSettings.findUnique({
        where: { shop },
      });

      console.log("🔍 Configurações encontradas:", {
        shop,
        settings: settings ? {
          id: settings.id,
          emailProvider: settings.emailProvider,
          emailApiKey: settings.emailApiKey ? "***definido***" : "vazio/null",
          emailFromAddress: settings.emailFromAddress || "vazio/null",
          emailFromName: settings.emailFromName,
          mailtrapToken: (settings as any).mailtrapToken ? "***definido***" : "vazio/null",
          mailtrapInboxId: (settings as any).mailtrapInboxId || "vazio/null",
        } : null
      });

      // Verificação específica por provedor
      const isMailtrap = settings?.emailProvider === "mailtrap";
      const hasRequiredConfig = isMailtrap 
        ? (settings as any).mailtrapToken && (settings as any).mailtrapInboxId
        : settings?.emailApiKey && settings?.emailFromAddress;

      if (!settings || !hasRequiredConfig) {
        console.log("❌ Configurações insuficientes:", {
          settings: !!settings,
          emailProvider: settings?.emailProvider,
          isMailtrap,
          emailApiKey: settings?.emailApiKey ? "definido" : "vazio/null", 
          emailFromAddress: settings?.emailFromAddress ? "definido" : "vazio/null",
          mailtrapToken: (settings as any)?.mailtrapToken ? "definido" : "vazio/null",
          mailtrapInboxId: (settings as any)?.mailtrapInboxId ? "definido" : "vazio/null",
        });
        
        return json({ 
          error: isMailtrap 
            ? "Configurações do Mailtrap não encontradas. Configure o API Token e Inbox ID nas Configurações."
            : "Configurações de email não encontradas. Configure primeiro nas Configurações." 
        }, { status: 400 });
      }

      // Buscar dados do produto via GraphQL
      let productTitle = 'Produto';
      let productImage = null;

      if (admin && productId) {
        try {
          const productQuery = `
            query getProduct($id: ID!) {
              product(id: $id) {
                title
                featuredImage {
                  url
                }
              }
            }
          `;

          const productResponse = await admin.graphql(productQuery, {
            variables: { id: productId },
          });

          const productData = await productResponse.json();
          
          if (productData.data?.product) {
            productTitle = productData.data.product.title;
            productImage = productData.data.product.featuredImage?.url;
          }
        } catch (error) {
          console.error("Error fetching product data:", error);
        }
      }

      // Gerar token seguro
      const token = EmailService.generateSecureToken();
      
      // Criar convite de review (agendado para envio imediato)
      const invitation = await db.reviewInvitation.create({
        data: {
          shop,
          orderId: `manual-${Date.now()}`,
          customerId: null,
          customerEmail,
          customerName,
          productId,
          productTitle,
          productImage,
          scheduledFor: new Date(), // Envio imediato
          token,
        },
      });

      // Configurar email
      const emailConfig = {
        provider: settings.emailProvider as "sendgrid" | "mailgun" | "smtp" | "mailtrap",
        apiKey: settings.emailApiKey || undefined,
        fromName: settings.emailFromName,
        fromEmail: settings.emailFromAddress || "noreply@example.com",
        mailtrapToken: (settings as any).mailtrapToken || undefined,
        mailtrapInboxId: (settings as any).mailtrapInboxId || undefined,
      };

      const emailService = new EmailService(emailConfig);
      
      // URL base do RWS (via variável de ambiente)
      const rwsBaseUrl = process.env.RWS_BASE_URL || "https://rws-three.vercel.app";
      
      // Criar URL de review que aponta para o RWS
      const reviewUrl = EmailService.createReviewUrl(
        rwsBaseUrl, 
        token, 
        productId.replace("gid://shopify/Product/", ""), 
        shop
      );

      const emailData = {
        customerName: customerName || 'Cliente',
        customerEmail,
        productTitle,
        productImage,
        reviewUrl,
        shopName: settings.emailFromName,
        token,
      };

      // Enviar email imediatamente
      const success = await emailService.sendReviewInvitation(emailData);
      
      if (success) {
        // Marcar como enviado
        await db.reviewInvitation.update({
          where: { id: invitation.id },
          data: { sentAt: new Date() },
        });

        return json({ 
          success: true, 
          message: `Convite enviado com sucesso para ${customerEmail}! O cliente receberá um link para avaliar no sistema RWS.` 
        });
      } else {
        // Remover convite se falhou
        await db.reviewInvitation.delete({
          where: { id: invitation.id },
        });
        
        return json({ 
          error: "Falha ao enviar email. Verifique suas configurações de email." 
        }, { status: 500 });
      }

    } catch (error) {
      console.error("Error sending manual invite:", error);
      return json({ 
        error: "Erro interno do servidor" 
      }, { status: 500 });
    }
  }

  return json({ success: true });
};

export default function Reviews() {
  const { reviews, pagination } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();

  // Estados para o modal de detalhes
  const [modalActive, setModalActive] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  
  // Estados para o modal de envio manual
  const [manualInviteModal, setManualInviteModal] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Estados para sincronização
  const [syncingReviews, setSyncingReviews] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  
  
  
  // Estados para os campos do formulário manual
  const [productId, setProductId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch('/app/api/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAction = (action: string, reviewId: string, published?: boolean) => {
    submit(
      { 
        action, 
        reviewId, 
        ...(published !== undefined && { published: published.toString() })
      },
      { method: "POST" }
    );
  };

  const handleManualInvite = () => {
    if (!productId || !customerName || !customerEmail) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    submit(
      {
        action: "send_manual_invite",
        productId,
        customerName,
        customerEmail,
      },
      { method: "post" }
    );
    
    // Limpar campos e fechar modal
    setProductId("");
    setCustomerName("");
    setCustomerEmail("");
    setSelectedProductId("");
    setManualInviteModal(false);
  };

  const handleSyncReviews = async () => {
    setSyncingReviews(true);
    setSyncMessage("");
    
    try {
      const response = await fetch('/api/sync-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop: window.shopify?.config?.shop || 'unknown-shop'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSyncMessage(result.message);
        // Recarregar a página para mostrar as novas reviews
        window.location.reload();
      } else {
        setSyncMessage(`Erro: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao sincronizar reviews:', error);
      setSyncMessage('Erro ao sincronizar reviews. Tente novamente.');
    } finally {
      setSyncingReviews(false);
    }
  };



  const handleFiltersChange = (filters: any) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        newParams.set(key, filters[key]);
      } else {
        newParams.delete(key);
      }
    });
    
    newParams.delete("page"); // Reset to first page when filtering
    setSearchParams(newParams);
  };

  const statusOptions = [
    { label: "Todos", value: "" },
    { label: "Publicados", value: "published" },
    { label: "Pendentes", value: "pending" },
  ];

  const ratingOptions = [
    { label: "Todas", value: "" },
    { label: "5 estrelas", value: "5" },
    { label: "4 estrelas", value: "4" },
    { label: "3 estrelas", value: "3" },
    { label: "2 estrelas", value: "2" },
    { label: "1 estrela", value: "1" },
  ];

  const reviewRows = reviews.map((review: any) => [
    <BlockStack key={`customer-${review.id}`} gap="100">
      <InlineStack gap="200" align="start">
        {/* Produto miniatura */}
        {review.productInfo?.image && (
          <img
            src={review.productInfo.image}
            alt={review.productInfo.title}
            style={{
              width: "32px",
              height: "32px",
              objectFit: "cover",
              borderRadius: "4px",
              border: "1px solid #e1e3e5"
            }}
          />
        )}
        <BlockStack gap="100">
          <Text as="span">{review.customerName || "Cliente Anônimo"}</Text>
          <Text as="span" variant="bodySm" tone={review.productInfo?.notFound ? "critical" : "subdued"}>
            {review.productInfo?.title ? `📦 ${review.productInfo.title.substring(0, 30)}${review.productInfo.title.length > 30 ? '...' : ''}` : '❌ Produto não encontrado'}
          </Text>
        </BlockStack>
      </InlineStack>
    </BlockStack>,
    <BlockStack key={`rating-${review.id}`} gap="100">
      <Text as="span">{"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}</Text>
      <InlineStack gap="100">
        <Text as="span" variant="bodySm" tone="subdued">
          {review.isFromRWS ? "📱 RWS" : "🛍️ Shopify"}
        </Text>
        {review.mediaUrls && review.mediaUrls.length > 0 && (
          <Text as="span" variant="bodySm" tone="success">
            📸 {review.mediaUrls.length}
          </Text>
        )}
      </InlineStack>
    </BlockStack>,
    <BlockStack key={`content-${review.id}`} gap="100">
      <Text as="span">{review.title || "Sem título"}</Text>
      <Text as="span" variant="bodySm" tone="subdued">
        {review.content ? review.content.substring(0, 60) + (review.content.length > 60 ? "..." : "") : "Sem comentário"}
      </Text>
    </BlockStack>,
    new Date(review.createdAt).toLocaleDateString("pt-BR"),
    <Text key={review.id} as="span" tone={review.published ? "success" : "caution"}>
      {review.published ? "Publicado" : "Pendente"}
    </Text>,
    <ClientOnly key={`actions-${review.id}`} fallback={<span>...</span>}>
      <InlineStack gap="200">
        <Button
          size="micro"
          onClick={() => {
            setSelectedReview(review);
            setModalActive(true);
          }}
        >
          Ver
        </Button>
        <Button
          size="micro"
          onClick={() => handleAction("toggle_review", review.id, review.published)}
        >
          {review.published ? "Ocultar" : "Publicar"}
        </Button>
        <Button
          size="micro"
          tone="critical"
          onClick={() => handleAction("delete_review", review.id)}
        >
          Excluir
        </Button>
      </InlineStack>
    </ClientOnly>,
  ]);

  return (
    <Page>
      <TitleBar title="Gerenciar Reviews" />
      <Layout>
        <Layout.Section>
          {actionData && 'success' in actionData && actionData.success && 'message' in actionData && (
            <ClientOnly>
              <Banner tone="success" onDismiss={() => {}}>
                <p>{actionData.message as string}</p>
              </Banner>
            </ClientOnly>
          )}
          
          {actionData && 'error' in actionData && actionData.error && (
            <ClientOnly>
              <Banner tone="critical" onDismiss={() => {}}>
                <p>{actionData.error as string}</p>
              </Banner>
            </ClientOnly>
          )}

          {syncMessage && (
            <ClientOnly>
              <Banner 
                tone={syncMessage.includes('Erro') ? "critical" : "success"} 
                onDismiss={() => setSyncMessage("")}
              >
                <p>{syncMessage}</p>
              </Banner>
            </ClientOnly>
          )}


          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  Filtros
                </Text>
                <ClientOnly fallback={<span>Carregando...</span>}>
                  <InlineStack gap="200">
                    <Button
                      onClick={handleSyncReviews}
                      loading={syncingReviews}
                      disabled={syncingReviews}
                    >
                      {syncingReviews ? "Sincronizando..." : "Sincronizar Reviews"}
                    </Button>
                  <Button
                    variant="primary"
                    onClick={() => setManualInviteModal(true)}
                  >
                    Enviar Convite Manual
                  </Button>
                  </InlineStack>
                </ClientOnly>
              </InlineStack>
              <InlineStack gap="400">
                <TextField
                  label="Buscar"
                  value={searchParams.get("search") || ""}
                  onChange={(value) => handleFiltersChange({ search: value })}
                  placeholder="Nome do cliente, título ou conteúdo..."
                  autoComplete="off"
                />
                <Select
                  label="Status"
                  options={statusOptions}
                  value={searchParams.get("status") || ""}
                  onChange={(value) => handleFiltersChange({ status: value })}
                />
                <Select
                  label="Avaliação"
                  options={ratingOptions}
                  value={searchParams.get("rating") || ""}
                  onChange={(value) => handleFiltersChange({ rating: value })}
                />
              </InlineStack>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  Reviews ({pagination.totalCount})
                </Text>
              </InlineStack>
              
              {reviews.length > 0 ? (
                <>
                  <ClientOnly fallback={<span>Carregando tabela...</span>}>
                    <DataTable
                      columnContentTypes={["text", "text", "text", "text", "text", "text"]}
                      headings={["Cliente & Produto", "Avaliação & Origem", "Título & Comentário", "Data", "Status", "Ações"]}
                      rows={reviewRows}
                    />
                  </ClientOnly>
                  
                  {pagination.totalPages > 1 && (
                    <ClientOnly fallback={<span>Carregando paginação...</span>}>
                      <Pagination
                        hasPrevious={pagination.hasPrevious}
                        onPrevious={() => {
                          const newParams = new URLSearchParams(searchParams);
                          newParams.set("page", (pagination.currentPage - 1).toString());
                          setSearchParams(newParams);
                        }}
                        hasNext={pagination.hasNext}
                        onNext={() => {
                          const newParams = new URLSearchParams(searchParams);
                          newParams.set("page", (pagination.currentPage + 1).toString());
                          setSearchParams(newParams);
                        }}
                        label={`Página ${pagination.currentPage} de ${pagination.totalPages}`}
                      />
                    </ClientOnly>
                  )}
                </>
              ) : (
                <EmptyState
                  heading="Nenhum review encontrado"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Não há reviews que correspondam aos filtros selecionados.</p>
                </EmptyState>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

      {/* Modal para ver detalhes do review */}
      {selectedReview && (
        <ClientOnly>
          <Modal
            open={modalActive}
            onClose={() => {
              setModalActive(false);
              setSelectedReview(null);
            }}
            title="Detalhes do Review"
            primaryAction={{
              content: "Fechar",
              onAction: () => {
                setModalActive(false);
                setSelectedReview(null);
              },
            }}
          >
          <Modal.Section>
            <BlockStack gap="400">
              {/* Informações do Produto */}
              {selectedReview.productInfo && (
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm">
                      📦 Produto Avaliado
                    </Text>
                    {selectedReview.productInfo.notFound ? (
                      <BlockStack gap="200">
                        <Text as="p" variant="bodyMd" tone="critical">
                          ❌ Produto não encontrado no Shopify
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          ID do produto: {selectedReview.productId}
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          Possíveis causas: produto deletado, ID incorreto ou permissões insuficientes
                        </Text>
                      </BlockStack>
                    ) : (
                      <InlineStack gap="300" align="start">
                        {selectedReview.productInfo.image && (
                          <img
                            src={selectedReview.productInfo.image}
                            alt={selectedReview.productInfo.imageAlt || selectedReview.productInfo.title}
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "1px solid #e1e3e5"
                            }}
                          />
                        )}
                        <BlockStack gap="100">
                          <Text as="p" variant="bodyMd" fontWeight="medium">
                            {selectedReview.productInfo.title}
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            Handle: {selectedReview.productInfo.handle}
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            ID: {selectedReview.productId}
                          </Text>
                        </BlockStack>
                      </InlineStack>
                    )}
                  </BlockStack>
                </Card>
              )}

              {/* Informações da Review */}
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    💬 Detalhes da Avaliação
                  </Text>
            <FormLayout>
                    <InlineStack gap="400">
              <TextField
                label="Cliente"
                value={selectedReview.customerName || "Cliente Anônimo"}
                readOnly
                autoComplete="off"
              />
              <TextField
                label="Email"
                value={selectedReview.customerEmail || "Não informado"}
                readOnly
                autoComplete="off"
              />
                    </InlineStack>
                    <InlineStack gap="400">
              <TextField
                label="Avaliação"
                        value={`${"★".repeat(selectedReview.rating)}${"☆".repeat(5 - selectedReview.rating)} (${selectedReview.rating}/5)`}
                readOnly
                autoComplete="off"
              />
                      <TextField
                        label="Origem"
                        value={selectedReview.isFromRWS ? "📱 RWS (com mídia)" : "🛍️ Shopify"}
                        readOnly
                        autoComplete="off"
                      />
                    </InlineStack>
              <TextField
                label="Título"
                value={selectedReview.title || "Sem título"}
                readOnly
                autoComplete="off"
              />
              <TextField
                label="Comentário"
                value={selectedReview.content || "Sem comentário"}
                multiline={4}
                readOnly
                autoComplete="off"
              />
              <TextField
                label="Data"
                value={new Date(selectedReview.createdAt).toLocaleString("pt-BR")}
                readOnly
                autoComplete="off"
              />
            </FormLayout>
                </BlockStack>
              </Card>

              {/* Mídias da Review */}
              {selectedReview.mediaUrls && selectedReview.mediaUrls.length > 0 && (
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm">
                      📸 Imagens e Vídeos ({selectedReview.mediaUrls.length})
                    </Text>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                      gap: "12px"
                    }}>
                      {selectedReview.mediaUrls.map((mediaUrl: string, index: number) => {
                        const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('.webm') || mediaUrl.includes('.mov');
                        
                        return (
                          <div
                            key={index}
                            style={{
                              border: "1px solid #e1e3e5",
                              borderRadius: "8px",
                              overflow: "hidden",
                              backgroundColor: "#f6f6f7"
                            }}
                          >
                            {isVideo ? (
                              <video
                                src={mediaUrl}
                                controls
                                style={{
                                  width: "100%",
                                  height: "120px",
                                  objectFit: "cover"
                                }}
                              />
                            ) : (
                              <img
                                src={mediaUrl}
                                alt={`Mídia ${index + 1} da review`}
                                style={{
                                  width: "100%",
                                  height: "120px",
                                  objectFit: "cover"
                                }}
                                onClick={() => window.open(mediaUrl, '_blank')}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <div style={{ padding: "8px" }}>
                              <Text as="p" variant="bodySm" tone="subdued">
                                {isVideo ? "🎥 Vídeo" : "📷 Imagem"} {index + 1}
                              </Text>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </BlockStack>
                </Card>
              )}
            </BlockStack>
          </Modal.Section>
        </Modal>
        </ClientOnly>
      )}

      {/* Modal para envio manual de convite */}
      <ClientOnly>
        <Modal
          open={manualInviteModal}
          onClose={() => setManualInviteModal(false)}
          title="Enviar Convite Manual de Review"
          primaryAction={{
            content: "Enviar Email",
            onAction: handleManualInvite,
          }}
          secondaryActions={[
            {
              content: "Cancelar",
              onAction: () => setManualInviteModal(false),
            },
          ]}
        >
        <Modal.Section>
          <ClientOnly>
            <Banner tone="info">
              <p>
                Use esta funcionalidade para testar o sistema de emails. 
                O convite será enviado imediatamente para o email informado.
              </p>
            </Banner>
          </ClientOnly>
          <form id="manual-invite-form">
            <FormLayout>
              <InlineStack gap="200" align="space-between">
                <TextField
                  label="ID do Produto"
                  name="productId"
                  value={productId}
                  onChange={setProductId}
                  placeholder="gid://shopify/Product/123456789"
                  helpText="Cole o ID completo do produto ou clique em 'Buscar Produtos'"
                  autoComplete="off"
                />
                <ClientOnly fallback={<span>Carregando...</span>}>
                  <Button
                    onClick={fetchProducts}
                    loading={loadingProducts}
                    disabled={loadingProducts}
                  >
                    Buscar Produtos
                  </Button>
                </ClientOnly>
              </InlineStack>
              
              {products.length > 0 && (
                <Select
                  label="Ou escolha um produto"
                  options={[
                    { label: "Selecione um produto...", value: "" },
                    ...products.map(product => ({
                      label: `${product.title} (${product.status})`,
                      value: product.id,
                    }))
                  ]}
                  value={selectedProductId}
                  onChange={(value) => {
                    setSelectedProductId(value);
                    setProductId(value);
                  }}
                />
              )}
              
              <TextField
                label="Nome do Cliente"
                name="customerName"
                value={customerName}
                onChange={setCustomerName}
                placeholder="João Silva"
                helpText="Nome que aparecerá no email"
                autoComplete="off"
              />
              <TextField
                label="Email do Cliente"
                name="customerEmail"
                value={customerEmail}
                onChange={setCustomerEmail}
                type="email"
                placeholder="joao@email.com"
                helpText="Email que receberá o convite de review"
                autoComplete="off"
              />
            </FormLayout>
          </form>
        </Modal.Section>
      </Modal>
      </ClientOnly>
    </Page>
  );
} 