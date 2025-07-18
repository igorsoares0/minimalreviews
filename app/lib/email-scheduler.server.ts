import db from "../db.server";
import { EmailService, type EmailConfig, type ReviewInvitationData } from "./email.server";

export class EmailScheduler {
  
  static async processScheduledEmails(): Promise<void> {
    console.log("Processing scheduled review emails...");
    
    const now = new Date();
    
    // Buscar convites agendados para envio
    const pendingInvitations = await db.reviewInvitation.findMany({
      where: {
        sentAt: null,
        scheduledFor: {
          lte: now,
        },
      },
      take: 50, // Processar em lotes
    });

    console.log(`Found ${pendingInvitations.length} pending invitations`);

    for (const invitation of pendingInvitations) {
      try {
        await this.sendReviewInvitation(invitation);
        
        // Marcar como enviado
        await db.reviewInvitation.update({
          where: { id: invitation.id },
          data: { sentAt: new Date() },
        });
        
        console.log(`Email sent successfully to ${invitation.customerEmail}`);
        
        // Aguardar um pouco entre emails para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Failed to send email to ${invitation.customerEmail}:`, error);
        
        // Se falhou, reagendar para 1 hora depois
        await db.reviewInvitation.update({
          where: { id: invitation.id },
          data: { 
            scheduledFor: new Date(Date.now() + 60 * 60 * 1000), // +1 hora
          },
        });
      }
    }
  }

  static async processReminders(): Promise<void> {
    console.log("Processing review reminders...");
    
    const now = new Date();
    const reminderDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 dias atrás
    
    // Buscar convites enviados há 7 dias que não foram respondidos
    const reminderCandidates = await db.reviewInvitation.findMany({
      where: {
        sentAt: {
          lte: reminderDate,
          gte: new Date(reminderDate.getTime() - 24 * 60 * 60 * 1000), // Janela de 24h
        },
        responded: false,
        reminderCount: {
          lt: 2, // Máximo 2 lembretes
        },
      },
      take: 25, // Processar em lotes menores
    });

    console.log(`Found ${reminderCandidates.length} reminder candidates`);

    for (const invitation of reminderCandidates) {
      try {
        await this.sendReviewReminder(invitation);
        
        // Atualizar contador de lembretes
        await db.reviewInvitation.update({
          where: { id: invitation.id },
          data: { 
            reminderCount: invitation.reminderCount + 1,
          },
        });
        
        console.log(`Reminder sent to ${invitation.customerEmail}`);
        
        // Aguardar entre emails
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Failed to send reminder to ${invitation.customerEmail}:`, error);
      }
    }
  }

  private static async sendReviewInvitation(invitation: any): Promise<void> {
    const settings = await db.reviewSettings.findUnique({
      where: { shop: invitation.shop },
    });

    if (!settings || !settings.emailApiKey || !settings.emailFromAddress) {
      throw new Error(`Email configuration missing for shop: ${invitation.shop}`);
    }

    const emailConfig: EmailConfig = {
      provider: settings.emailProvider as "sendgrid" | "mailgun" | "smtp" | "mailtrap",
      apiKey: settings.emailApiKey || undefined,
      fromName: settings.emailFromName,
      fromEmail: settings.emailFromAddress || '',
      mailtrapToken: (settings as any).mailtrapToken || undefined,
      mailtrapInboxId: (settings as any).mailtrapInboxId || undefined,
    };

    const emailService = new EmailService(emailConfig);
    
    // Usar a URL do RWS configurada via variável de ambiente
    const rwsBaseUrl = process.env.RWS_BASE_URL || "https://rws-three.vercel.app";
    const reviewUrl = EmailService.createReviewUrl(rwsBaseUrl, invitation.token);

    const emailData: ReviewInvitationData = {
      customerName: invitation.customerName || 'Cliente',
      customerEmail: invitation.customerEmail,
      productTitle: invitation.productTitle,
      productImage: invitation.productImage,
      reviewUrl,
      shopName: settings.emailFromName,
      token: invitation.token,
    };

    const success = await emailService.sendReviewInvitation(emailData);
    
    if (!success) {
      throw new Error("Failed to send email");
    }
  }

  private static async sendReviewReminder(invitation: any): Promise<void> {
    // Similar ao sendReviewInvitation, mas com template de lembrete
    const settings = await db.reviewSettings.findUnique({
      where: { shop: invitation.shop },
    });

    if (!settings || !settings.emailApiKey || !settings.emailFromAddress) {
      throw new Error(`Email configuration missing for shop: ${invitation.shop}`);
    }

    const emailConfig: EmailConfig = {
      provider: settings.emailProvider as "sendgrid" | "mailgun" | "smtp" | "mailtrap",
      apiKey: settings.emailApiKey || undefined,
      fromName: settings.emailFromName,
      fromEmail: settings.emailFromAddress || '',
      mailtrapToken: (settings as any).mailtrapToken || undefined,
      mailtrapInboxId: (settings as any).mailtrapInboxId || undefined,
    };

    const emailService = new EmailService(emailConfig);
    
    // Usar a URL do RWS configurada via variável de ambiente
    const rwsBaseUrl = process.env.RWS_BASE_URL || "https://rws-three.vercel.app";
    const reviewUrl = EmailService.createReviewUrl(rwsBaseUrl, invitation.token);

    // Para lembretes, podemos usar o mesmo template por enquanto
    // Em uma versão futura, poderíamos ter templates específicos
    const emailData: ReviewInvitationData = {
      customerName: invitation.customerName || 'Cliente',
      customerEmail: invitation.customerEmail,
      productTitle: invitation.productTitle,
      productImage: invitation.productImage,
      reviewUrl,
      shopName: settings.emailFromName,
      token: invitation.token,
    };

    const success = await emailService.sendReviewInvitation(emailData);
    
    if (!success) {
      throw new Error("Failed to send reminder email");
    }
  }

  static async markAsResponded(token: string): Promise<void> {
    await db.reviewInvitation.updateMany({
      where: { token },
      data: { responded: true },
    });
  }

  static async getInvitationByToken(token: string) {
    return await db.reviewInvitation.findUnique({
      where: { token },
    });
  }
} 