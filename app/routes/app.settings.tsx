import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher, Form, useActionData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  FormLayout,
  Checkbox,
  TextField,
  Select,
  Banner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { ClientOnly } from "../components/ClientOnly";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  let settings = await db.reviewSettings.findUnique({
    where: { shop },
  });

  if (!settings) {
    settings = await db.reviewSettings.create({
      data: { shop },
    });
  }

  return json({ settings });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();

  const autoPublish = formData.get("autoPublish") === "on";
  const requireApproval = formData.get("requireApproval") === "on";
  const allowAnonymous = formData.get("allowAnonymous") === "on";
  const sendEmailNotification = formData.get("sendEmailNotification") === "on";
  const showOnProductPage = formData.get("showOnProductPage") === "on";
  const starColor = formData.get("starColor") as string;
  const maxReviewLength = parseInt(formData.get("maxReviewLength") as string);
  
  // Configurações de email
  const emailProvider = formData.get("emailProvider") as string;
  const emailApiKey = formData.get("emailApiKey") as string;
  const emailFromName = formData.get("emailFromName") as string;
  const emailFromAddress = formData.get("emailFromAddress") as string;
  const mailtrapToken = formData.get("mailtrapToken") as string;
  const mailtrapInboxId = formData.get("mailtrapInboxId") as string;
  
  // Configuração do backend externo
  const externalApiUrl = formData.get("externalApiUrl") as string;

  // Configurações de envio automático
  const autoSendEnabledValue = formData.get("autoSendEnabled") as string;
  const autoSendEnabled = autoSendEnabledValue === "on";
  const autoSendDaysAfter = parseInt(formData.get("autoSendDaysAfter") as string) || 7;
  const autoSendMaxReminders = parseInt(formData.get("autoSendMaxReminders") as string) || 2;
  const autoSendReminderDays = parseInt(formData.get("autoSendReminderDays") as string) || 7;

  console.log("🔍 Debug checkbox:", {
    autoSendEnabledValue,
    autoSendEnabled,
    formDataKeys: Array.from(formData.keys()),
  });

  console.log("📧 Salvando configurações:", {
    shop,
    emailProvider,
    emailApiKey: emailApiKey ? "***definido***" : "vazio",
    emailFromName,
    emailFromAddress,
    mailtrapToken: mailtrapToken ? "***definido***" : "vazio",
    mailtrapInboxId,
    autoSendEnabled,
    autoSendDaysAfter,
    autoSendMaxReminders,
    autoSendReminderDays,
  });

  const savedSettings = await db.reviewSettings.upsert({
    where: { shop },
    update: {
      autoPublish,
      requireApproval,
      allowAnonymous,
      sendEmailNotification,
      showOnProductPage,
      starColor,
      maxReviewLength,
      emailProvider,
      emailApiKey: emailApiKey || null,
      emailFromName,
      emailFromAddress: emailFromAddress || null,
      autoSendEnabled,
      autoSendDaysAfter,
      autoSendMaxReminders,
      autoSendReminderDays,
      externalApiUrl: externalApiUrl || null,
    },
    create: {
      shop,
      autoPublish,
      requireApproval,
      allowAnonymous,
      sendEmailNotification,
      showOnProductPage,
      starColor,
      maxReviewLength,
      emailProvider,
      emailApiKey: emailApiKey || null,
      emailFromName,
      emailFromAddress: emailFromAddress || null,
      autoSendEnabled,
      autoSendDaysAfter,
      autoSendMaxReminders,
      autoSendReminderDays,
      externalApiUrl: externalApiUrl || null,
    },
  });

  // Atualizar campos extras usando SQL raw (apenas para campos que não estão no schema principal)
  await db.$executeRaw`
    UPDATE ReviewSettings 
    SET mailtrapToken = ${emailProvider === "mailtrap" ? (mailtrapToken || null) : null}, 
        mailtrapInboxId = ${emailProvider === "mailtrap" ? (mailtrapInboxId || null) : null}
    WHERE shop = ${shop}
  `;

  console.log("✅ Configurações salvas:", {
    id: savedSettings.id,
    emailProvider: savedSettings.emailProvider,
    emailApiKey: savedSettings.emailApiKey ? "***definido***" : "vazio",
    emailFromAddress: savedSettings.emailFromAddress,
    mailtrapToken: (savedSettings as any).mailtrapToken ? "***definido***" : "vazio",
    mailtrapInboxId: (savedSettings as any).mailtrapInboxId || "vazio",
    autoSendEnabled: (savedSettings as any).autoSendEnabled,
    autoSendDaysAfter: (savedSettings as any).autoSendDaysAfter,
  });

  return json({ 
    success: true, 
    message: "Configurações salvas com sucesso!" 
  });
};

export default function Settings() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [starColor, setStarColor] = useState(settings.starColor);
  const [emailProvider, setEmailProvider] = useState(settings.emailProvider);
  const [maxReviewLength, setMaxReviewLength] = useState(settings.maxReviewLength.toString());
  const [mailtrapToken, setMailtrapToken] = useState((settings as any).mailtrapToken || "");
  const [mailtrapInboxId, setMailtrapInboxId] = useState((settings as any).mailtrapInboxId || "");
  const [emailApiKey, setEmailApiKey] = useState(settings.emailApiKey || "");
  const [emailFromName, setEmailFromName] = useState(settings.emailFromName);
  const [emailFromAddress, setEmailFromAddress] = useState(settings.emailFromAddress || "");
  const [externalApiUrl, setExternalApiUrl] = useState((settings as any).externalApiUrl || "http://localhost:3000/api");

  // Estados para envio automático
  const [autoSendEnabled, setAutoSendEnabled] = useState((settings as any).autoSendEnabled || false);
  const [autoSendDaysAfter, setAutoSendDaysAfter] = useState(((settings as any).autoSendDaysAfter || 7).toString());
  const [autoSendMaxReminders, setAutoSendMaxReminders] = useState(((settings as any).autoSendMaxReminders || 2).toString());
  const [autoSendReminderDays, setAutoSendReminderDays] = useState(((settings as any).autoSendReminderDays || 7).toString());

  const maxLengthOptions = [
    { label: "100 caracteres", value: "100" },
    { label: "250 caracteres", value: "250" },
    { label: "500 caracteres", value: "500" },
    { label: "1000 caracteres", value: "1000" },
  ];

  const emailProviderOptions = [
    { label: "SendGrid", value: "sendgrid" },
    { label: "Mailgun", value: "mailgun" },
    { label: "Mailtrap (Teste)", value: "mailtrap" },
    { label: "SMTP (em breve)", value: "smtp", disabled: true },
  ];

  const daysAfterOptions = [
    { label: "1 dia", value: "1" },
    { label: "2 dias", value: "2" },
    { label: "3 dias", value: "3" },
    { label: "7 dias", value: "7" },
    { label: "14 dias", value: "14" },
    { label: "21 dias", value: "21" },
    { label: "30 dias", value: "30" },
  ];

  const maxRemindersOptions = [
    { label: "Nenhum lembrete", value: "0" },
    { label: "1 lembrete", value: "1" },
    { label: "2 lembretes", value: "2" },
    { label: "3 lembretes", value: "3" },
  ];

  const reminderDaysOptions = [
    { label: "3 dias", value: "3" },
    { label: "7 dias", value: "7" },
    { label: "14 dias", value: "14" },
  ];

  return (
    <Page>
      <TitleBar title="Configurações do App" />
      <Layout>
        <Layout.Section>
          <Form method="post">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Configurações Gerais
                  </Text>
                  <FormLayout>
                    <Checkbox
                      label="Auto-publicar reviews"
                      helpText="Reviews são publicados automaticamente sem necessidade de aprovação"
                      checked={settings.autoPublish}
                      name="autoPublish"
                    />
                    <Checkbox
                      label="Exigir aprovação manual"
                      helpText="Todos os reviews precisam ser aprovados antes de aparecer na loja"
                      checked={settings.requireApproval}
                      name="requireApproval"
                    />
                    <Checkbox
                      label="Permitir reviews anônimos"
                      helpText="Clientes podem deixar reviews sem fazer login"
                      checked={settings.allowAnonymous}
                      name="allowAnonymous"
                    />
                    <Checkbox
                      label="Notificações por email"
                      helpText="Enviar emails automáticos convidando para reviews"
                      checked={settings.sendEmailNotification}
                      name="sendEmailNotification"
                    />
                    <Checkbox
                      label="Mostrar na página do produto"
                      helpText="Exibir reviews automaticamente nas páginas dos produtos"
                      checked={settings.showOnProductPage}
                      name="showOnProductPage"
                    />
                  </FormLayout>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Personalização
                  </Text>
                  <FormLayout>
                    <TextField
                      label="Cor das estrelas"
                      value={starColor}
                      onChange={setStarColor}
                      name="starColor"
                      helpText="Digite a cor em formato hexadecimal (ex: #FFD700)"
                      placeholder="#FFD700"
                      autoComplete="off"
                    />
                    <Select
                      label="Tamanho máximo do review"
                      options={maxLengthOptions}
                      value={maxReviewLength}
                      onChange={setMaxReviewLength}
                      name="maxReviewLength"
                    />
                  </FormLayout>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Configurações de Email
                  </Text>
                  <ClientOnly>
                    <Banner tone="info">
                      <p>
                        Configure um provedor de email para enviar convites automáticos de review após as compras.
                      </p>
                    </Banner>
                  </ClientOnly>
                  <FormLayout>
                    <Select
                      label="Provedor de Email"
                      options={emailProviderOptions}
                      value={emailProvider}
                      onChange={setEmailProvider}
                      name="emailProvider"
                    />
                    
                    {emailProvider === "mailtrap" ? (
                      <>
                        <TextField
                          label="API Token"
                          value={mailtrapToken}
                          onChange={setMailtrapToken}
                          name="mailtrapToken"
                          type="password"
                          helpText="Seu API Token do Mailtrap (encontrado em API Tokens)"
                          placeholder="Digite seu API Token..."
                          autoComplete="off"
                        />
                        <TextField
                          label="Inbox ID"
                          value={mailtrapInboxId}
                          onChange={setMailtrapInboxId}
                          name="mailtrapInboxId"
                          helpText="ID da inbox de teste do Mailtrap (número da inbox)"
                          placeholder="Digite o ID da inbox..."
                          autoComplete="off"
                        />
                      </>
                    ) : (
                      <TextField
                        label="API Key"
                        value={emailApiKey}
                        onChange={setEmailApiKey}
                        name="emailApiKey"
                        type="password"
                        helpText={
                          emailProvider === "sendgrid" 
                            ? "Sua API Key do SendGrid (começa com SG.)"
                            : emailProvider === "mailgun"
                            ? "Sua API Key do Mailgun (key-xxxxx)"
                            : "API Key do provedor de email"
                        }
                        placeholder="Digite sua API Key..."
                        autoComplete="off"
                      />
                    )}
                    
                    <TextField
                      label="Nome do Remetente"
                      value={emailFromName}
                      onChange={setEmailFromName}
                      name="emailFromName"
                      helpText="Nome que aparecerá como remetente dos emails"
                      placeholder="Sua Loja"
                      autoComplete="off"
                    />
                    <TextField
                      label="Email do Remetente"
                      value={emailFromAddress}
                      onChange={setEmailFromAddress}
                      name="emailFromAddress"
                      type="email"
                      helpText={
                        emailProvider === "mailtrap" 
                          ? "Qualquer email válido (para testes no Mailtrap)"
                          : "Email que será usado como remetente (deve estar verificado no provedor)"
                      }
                      placeholder={
                        emailProvider === "mailtrap" 
                          ? "teste@exemplo.com"
                          : "noreply@sualoja.com"
                      }
                      autoComplete="off"
                    />
                  </FormLayout>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Backend Externo de Reviews
                  </Text>
                  <ClientOnly>
                    <Banner tone="info">
                      <p>
                        Configure a URL do seu backend externo para onde as reviews serão enviadas.
                        O sistema se conectará com sua API para armazenar e gerenciar as avaliações.
                      </p>
                    </Banner>
                  </ClientOnly>
                  <FormLayout>
                    <TextField
                      label="URL da API Externa"
                      value={externalApiUrl}
                      onChange={setExternalApiUrl}
                      name="externalApiUrl"
                      helpText="URL base da sua API de reviews (ex: http://localhost:3000/api)"
                      placeholder="http://localhost:3000/api"
                      autoComplete="off"
                    />
                  </FormLayout>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Como Instalar na Loja
                  </Text>
                  <ClientOnly>
                    <Banner tone="info">
                      <p>
                        Para que os reviews apareçam na sua loja, você precisa ativar a extensão:
                      </p>
                      <ol style={{ marginTop: "8px", paddingLeft: "20px" }}>
                        <li>Vá para <strong>Online Store → Themes</strong></li>
                        <li>Clique em <strong>Customize</strong> no seu tema ativo</li>
                        <li>Navegue até uma página de produto</li>
                        <li>Adicione a seção <strong>"Star Rating"</strong></li>
                        <li>Configure as opções e salve</li>
                      </ol>
                    </Banner>
                  </ClientOnly>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Configurações de Envio Automático
                  </Text>
                  <ClientOnly>
                    <Banner tone="info">
                      <p>
                        Configure o envio automático de emails de convidado.
                      </p>
                    </Banner>
                  </ClientOnly>
                  <FormLayout>
                    <Checkbox
                      label="Ativar envio automático"
                      helpText="Enviar emails automáticos de convidado"
                      checked={autoSendEnabled}
                      onChange={setAutoSendEnabled}
                    />
                    <input 
                      type="hidden" 
                      name="autoSendEnabled" 
                      value={autoSendEnabled ? "on" : ""} 
                    />
                    <Select
                      label="Dias após a compra"
                      options={daysAfterOptions}
                      value={autoSendDaysAfter}
                      onChange={setAutoSendDaysAfter}
                      name="autoSendDaysAfter"
                    />
                    <Select
                      label="Número de lembretes"
                      options={maxRemindersOptions}
                      value={autoSendMaxReminders}
                      onChange={setAutoSendMaxReminders}
                      name="autoSendMaxReminders"
                    />
                    <Select
                      label="Dias entre lembretes"
                      options={reminderDaysOptions}
                      value={autoSendReminderDays}
                      onChange={setAutoSendReminderDays}
                      name="autoSendReminderDays"
                    />
                  </FormLayout>
                </BlockStack>
              </Card>

              <ClientOnly fallback={<span>Carregando...</span>}>
                <Button submit variant="primary" size="large">
                  Salvar Configurações
                </Button>
              </ClientOnly>
            </BlockStack>
          </Form>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 