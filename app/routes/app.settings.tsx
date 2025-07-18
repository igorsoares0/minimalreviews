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
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;
    const formData = await request.formData();

  const autoPublish = formData.get("autoPublish") === "on";
  const requireApproval = formData.get("requireApproval") === "on";
  const sendEmailNotification = formData.get("sendEmailNotification") === "on";
  const showOnProductPage = formData.get("showOnProductPage") === "on";
  
  // Configurações de email
  const emailProvider = formData.get("emailProvider") as string;
  const emailApiKey = formData.get("emailApiKey") as string;
  const emailFromName = formData.get("emailFromName") as string;
  const emailFromAddress = formData.get("emailFromAddress") as string;
  const mailtrapToken = formData.get("mailtrapToken") as string;
  const mailtrapInboxId = formData.get("mailtrapInboxId") as string;
  

  // Configurações de envio automático
  const autoSendEnabledValue = formData.get("autoSendEnabled") as string;
  const autoSendEnabled = autoSendEnabledValue === "on";
  const autoSendDaysAfter = parseFloat(formData.get("autoSendDaysAfter") as string) || 7;
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
      sendEmailNotification,
      showOnProductPage,
      emailProvider,
      emailApiKey: emailApiKey || null,
      emailFromName,
      emailFromAddress: emailFromAddress || null,
      autoSendEnabled,
      autoSendDaysAfter,
      autoSendMaxReminders,
      autoSendReminderDays,
    },
    create: {
      shop,
      autoPublish,
      requireApproval,
      sendEmailNotification,
      showOnProductPage,
      emailProvider,
      emailApiKey: emailApiKey || null,
      emailFromName,
      emailFromAddress: emailFromAddress || null,
      autoSendEnabled,
      autoSendDaysAfter,
      autoSendMaxReminders,
      autoSendReminderDays,
    },
  });

  // Atualizar campos extras usando SQL raw (apenas para campos que não estão no schema principal)
  await db.$executeRaw`
    UPDATE "ReviewSettings" 
    SET "mailtrapToken" = ${emailProvider === "mailtrap" ? (mailtrapToken || null) : null}, 
        "mailtrapInboxId" = ${emailProvider === "mailtrap" ? (mailtrapInboxId || null) : null}
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
  } catch (error) {
    console.error("❌ Erro ao salvar configurações:", error);
    return json({ 
      success: false, 
      message: "Erro ao salvar configurações. Por favor, tente novamente.",
      error: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 });
  }
};

export default function Settings() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [emailProvider, setEmailProvider] = useState(settings.emailProvider);
  const [mailtrapToken, setMailtrapToken] = useState((settings as any).mailtrapToken || "");
  const [mailtrapInboxId, setMailtrapInboxId] = useState((settings as any).mailtrapInboxId || "");
  const [emailApiKey, setEmailApiKey] = useState(settings.emailApiKey || "");
  const [emailFromName, setEmailFromName] = useState(settings.emailFromName);
  const [emailFromAddress, setEmailFromAddress] = useState(settings.emailFromAddress || "");

  // Estados para envio automático
  const [autoSendEnabled, setAutoSendEnabled] = useState((settings as any).autoSendEnabled || false);
  const [autoSendDaysAfter, setAutoSendDaysAfter] = useState(((settings as any).autoSendDaysAfter || 7).toString());
  const [autoSendMaxReminders, setAutoSendMaxReminders] = useState(((settings as any).autoSendMaxReminders || 2).toString());
  const [autoSendReminderDays, setAutoSendReminderDays] = useState(((settings as any).autoSendReminderDays || 7).toString());


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
    { label: "5 dias", value: "5" },
    { label: "7 dias", value: "7" },
    { label: "14 dias", value: "14" },
    { label: "30 dias", value: "30" },
    { label: "5 minutos (teste)", value: "0.003" },
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