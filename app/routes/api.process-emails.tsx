import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import db from "../db.server";
import { EmailService } from "../lib/email.server";
import type { EmailConfig, ReviewInvitationData } from "../lib/email.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    console.log("🔄 Iniciando processamento de emails automáticos...");

    const now = new Date();
    
    // Buscar convites que precisam ser enviados
    const pendingInvitations = await db.reviewInvitation.findMany({
      where: {
        sentAt: null,
        scheduledFor: {
          lte: now
        }
      },
      take: 50 // Processar no máximo 50 por vez
    });

    console.log(`📧 Encontrados ${pendingInvitations.length} convites pendentes`);

    let sent = 0;
    let failed = 0;

    for (const invitation of pendingInvitations) {
      try {
        // Buscar configurações da loja
        const settings = await db.reviewSettings.findUnique({
          where: { shop: invitation.shop }
        });

        if (!settings || !settings.sendEmailNotification) {
          console.log(`⚠️ Envio de email desativado para ${invitation.shop}`);
          continue;
        }

        if (!settings.emailApiKey || !settings.emailFromAddress) {
          console.log(`⚠️ Configurações de email incompletas para ${invitation.shop}`);
          continue;
        }

        // Configurar EmailService
        const emailConfig: EmailConfig = {
          provider: settings.emailProvider as any,
          apiKey: settings.emailApiKey ?? undefined,
          fromName: settings.emailFromName,
          fromEmail: settings.emailFromAddress ?? "noreply@example.com",
          mailtrapToken: settings.mailtrapToken ?? undefined,
          mailtrapInboxId: settings.mailtrapInboxId ?? undefined,
        };

        const emailService = new EmailService(emailConfig);

        // Criar URL de review que aponta para o RWS
        const rwsBaseUrl = settings.rwsBaseUrl || 'http://localhost:3002';
        const reviewUrl = EmailService.createReviewUrl(
          rwsBaseUrl, 
          invitation.token, 
          invitation.productId.replace("gid://shopify/Product/", ""), 
          invitation.shop
        );

        const emailData: ReviewInvitationData = {
          customerName: invitation.customerName || 'Cliente',
          customerEmail: invitation.customerEmail,
          productTitle: invitation.productTitle,
          productImage: invitation.productImage ?? undefined,
          reviewUrl,
          shopName: settings.emailFromName,
          token: invitation.token,
        };

        // Enviar email
        const success = await emailService.sendReviewInvitation(emailData);

        if (success) {
          // Marcar como enviado
          await db.reviewInvitation.update({
            where: { id: invitation.id },
            data: { sentAt: now }
          });
          sent++;
          console.log(`✅ Email enviado para ${invitation.customerEmail}`);
        } else {
          failed++;
          console.log(`❌ Falha ao enviar email para ${invitation.customerEmail}`);
        }

      } catch (error) {
        failed++;
        console.error(`❌ Erro processando convite ${invitation.id}:`, error);
      }
    }
    
    // Processar lembretes
    const reminderStats = await processReminders();
    
    console.log(`📊 Processamento concluído: ${sent} enviados, ${failed} falharam`);
    console.log(`📊 Lembretes: ${reminderStats.sent} enviados, ${reminderStats.failed} falharam`);
    
    return json({ 
      success: true, 
      invitations: {
        sent,
        failed,
        processed: pendingInvitations.length
      },
      reminders: reminderStats
    });
    
  } catch (error) {
    console.error("❌ Erro no processamento de emails:", error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

async function processReminders() {
  const now = new Date();
  let sent = 0;
  let failed = 0;

  try {
    // Buscar convites enviados que não foram respondidos e podem receber lembretes
    const candidatesForReminder = await db.reviewInvitation.findMany({
      where: {
        sentAt: { not: null },
        responded: false,
      }
    });

    for (const invitation of candidatesForReminder) {
      try {
        // Buscar configurações da loja
        const settings = await db.reviewSettings.findUnique({
          where: { shop: invitation.shop }
        });

        if (!settings || !(settings as any)?.autoSendEnabled) continue;

        const maxReminders = (settings as any).autoSendMaxReminders || 0;
        const reminderDays = (settings as any).autoSendReminderDays || 7;

        // Verificar se pode enviar lembrete
        if (invitation.reminderCount >= maxReminders) continue;

        // Calcular quando deve enviar o próximo lembrete
        const lastSentDate = invitation.sentAt!;
        const daysSinceLastSent = Math.floor(
          (now.getTime() - lastSentDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        const shouldSendReminderAt = reminderDays * (invitation.reminderCount + 1);
        
        if (daysSinceLastSent < shouldSendReminderAt) continue;

        console.log(`🔔 Enviando lembrete para ${invitation.customerEmail}`);

        // Configurar EmailService
        const emailConfig: EmailConfig = {
          provider: settings.emailProvider as any,
          apiKey: settings.emailApiKey ?? undefined,
          fromName: settings.emailFromName,
          fromEmail: settings.emailFromAddress ?? "noreply@example.com",
          mailtrapToken: settings.mailtrapToken ?? undefined,
          mailtrapInboxId: settings.mailtrapInboxId ?? undefined,
        };

        const emailService = new EmailService(emailConfig);

        // Criar URL de review
        const rwsBaseUrl = settings.rwsBaseUrl || 'http://localhost:3002';
        const reviewUrl = EmailService.createReviewUrl(
          rwsBaseUrl, 
          invitation.token, 
          invitation.productId.replace("gid://shopify/Product/", ""), 
          invitation.shop
        );

        const emailData: ReviewInvitationData = {
          customerName: invitation.customerName || 'Cliente',
          customerEmail: invitation.customerEmail,
          productTitle: `[LEMBRETE ${invitation.reminderCount + 1}] ${invitation.productTitle}`,
          productImage: invitation.productImage ?? undefined,
          reviewUrl,
          shopName: settings.emailFromName,
          token: invitation.token,
        };

        // Enviar lembrete (usando o mesmo método de convite)
        const success = await emailService.sendReviewInvitation(emailData);

        if (success) {
          // Atualizar contador de lembretes
          await db.reviewInvitation.update({
            where: { id: invitation.id },
            data: { 
              reminderCount: invitation.reminderCount + 1,
              updatedAt: now
            }
          });
          sent++;
          console.log(`✅ Lembrete enviado para ${invitation.customerEmail}`);
        } else {
          failed++;
          console.log(`❌ Falha ao enviar lembrete para ${invitation.customerEmail}`);
        }

      } catch (error) {
        failed++;
        console.error(`❌ Erro processando lembrete ${invitation.id}:`, error);
      }
    }

  } catch (error) {
    console.error("❌ Erro no processamento de lembretes:", error);
  }

  return { sent, failed };
}

export async function loader() {
  return json({ message: "Use POST to process emails" });
} 