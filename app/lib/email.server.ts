import { randomBytes } from "crypto";

export interface EmailConfig {
  provider: "sendgrid" | "mailgun" | "smtp" | "mailtrap";
  apiKey?: string;
  fromName: string;
  fromEmail: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  // Para Mailtrap
  mailtrapToken?: string;
  mailtrapInboxId?: string;
}

export interface ReviewInvitationData {
  customerName: string;
  customerEmail: string;
  productTitle: string;
  productImage?: string;
  reviewUrl: string;
  shopName: string;
  token: string;
}

export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  async sendReviewInvitation(data: ReviewInvitationData): Promise<boolean> {
    const template = this.getReviewInvitationTemplate(data);
    
    try {
      switch (this.config.provider) {
        case "sendgrid":
          return await this.sendWithSendGrid(data.customerEmail, template);
        case "mailgun":
          return await this.sendWithMailgun(data.customerEmail, template);
        case "mailtrap":
          return await this.sendWithMailtrap(data.customerEmail, template);
        case "smtp":
          return await this.sendWithSMTP(data.customerEmail, template);
        default:
          throw new Error(`Provedor de email não suportado: ${this.config.provider}`);
      }
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      return false;
    }
  }

  private async sendWithSendGrid(to: string, template: EmailTemplate): Promise<boolean> {
    if (!this.config.apiKey) {
      throw new Error("API Key do SendGrid não configurada");
    }

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
          subject: template.subject,
        }],
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName,
        },
        content: [
          {
            type: "text/plain",
            value: template.text,
          },
          {
            type: "text/html",
            value: template.html,
          },
        ],
      }),
    });

    return response.ok;
  }

  private async sendWithMailgun(to: string, template: EmailTemplate): Promise<boolean> {
    if (!this.config.apiKey) {
      throw new Error("API Key do Mailgun não configurada");
    }

    // Extrair domínio da API key do Mailgun (formato: key-xxxxx)
    const domain = process.env.MAILGUN_DOMAIN || "mg.yourdomain.com";
    
    const formData = new FormData();
    formData.append("from", `${this.config.fromName} <${this.config.fromEmail}>`);
    formData.append("to", to);
    formData.append("subject", template.subject);
    formData.append("text", template.text);
    formData.append("html", template.html);

    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`api:${this.config.apiKey}`).toString("base64")}`,
      },
      body: formData,
    });

    return response.ok;
  }

  private async sendWithMailtrap(to: string, template: EmailTemplate): Promise<boolean> {
    if (!this.config.mailtrapToken || !this.config.mailtrapInboxId) {
      throw new Error("Token ou Inbox ID do Mailtrap não configurados");
    }

    console.log("🚀 Tentando enviar via Mailtrap Testing API:");
    console.log("📧 URL:", `https://sandbox.api.mailtrap.io/api/send/${this.config.mailtrapInboxId}`);
    console.log("🔑 Token (primeiros 10 chars):", this.config.mailtrapToken.substring(0, 10) + "...");
    console.log("📦 Inbox ID:", this.config.mailtrapInboxId);

    const response = await fetch(`https://sandbox.api.mailtrap.io/api/send/${this.config.mailtrapInboxId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.config.mailtrapToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName,
        },
        to: [
          {
            email: to,
          }
        ],
        subject: template.subject,
        text: template.text,
        html: template.html,
        category: "Review Invitation",
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Mailtrap API error:", errorData);
      throw new Error(`Mailtrap API error: ${response.status}`);
    }

    return true;
  }

  private async sendWithSMTP(to: string, template: EmailTemplate): Promise<boolean> {
    // Para SMTP, você precisaria de uma biblioteca como nodemailer
    // Por simplicidade, vou implementar um placeholder
    console.log("SMTP não implementado ainda. Use SendGrid ou Mailgun.");
    return false;
  }

  private getReviewInvitationTemplate(data: ReviewInvitationData): EmailTemplate {
    const subject = `Como foi sua experiência com ${data.productTitle}?`;
    
    const text = `
Olá ${data.customerName}!

Esperamos que você esteja satisfeito(a) com sua compra de ${data.productTitle}.

Sua opinião é muito importante para nós e para outros clientes. Que tal compartilhar sua experiência?

⭐ Avaliar produto: ${data.reviewUrl}

Por que avaliar?
• Ajuda outros clientes a escolherem melhor
• Leva apenas alguns segundos  
• Ganhe desconto na próxima compra!
• Compartilhe fotos e vídeos do produto

Obrigado,
Equipe ${data.shopName}

---
Se não deseja mais receber estes emails: ${data.reviewUrl}&unsubscribe=${data.token}
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Avalie sua compra</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
        .content { padding: 40px 30px; }
        .product { background: #f8f9ff; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #667eea; }
        .product img { max-width: 120px; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .cta-section { text-align: center; margin: 35px 0; }
        .stars { color: #FFD700; font-size: 32px; margin-bottom: 15px; text-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 50px; 
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
        }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6); }
        .benefits { background: #f0f7ff; padding: 25px; border-radius: 12px; margin: 25px 0; }
        .benefits ul { margin: 0; padding-left: 20px; }
        .benefits li { margin: 8px 0; color: #4a5568; }
        .footer { margin-top: 40px; padding-top: 25px; border-top: 2px solid #e2e8f0; text-align: center; }
        .footer p { margin: 5px 0; color: #718096; }
        .footer small { font-size: 12px; color: #a0aec0; }
        .unsubscribe { color: #667eea; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✨ Como foi sua experiência?</h1>
            <p>Olá ${data.customerName}!</p>
        </div>
        
        <div class="content">
        <div class="product">
                ${data.productImage ? `<img src="${data.productImage}" alt="${data.productTitle}" style="float: left; margin-right: 20px;">` : ''}
                <h3 style="margin: 0 0 10px 0; color: #2d3748; font-size: 20px;">${data.productTitle}</h3>
                <p style="margin: 0; color: #4a5568;">Esperamos que você esteja satisfeito(a) com sua compra!</p>
                <div style="clear: both;"></div>
        </div>
        
            <p style="font-size: 16px; color: #4a5568;">Sua opinião é muito importante para nós e para outros clientes. Que tal compartilhar sua experiência?</p>
        
            <div class="cta-section">
            <div class="stars">★ ★ ★ ★ ★</div>
                <p style="font-size: 18px; margin-bottom: 20px; color: #2d3748;">Clique para avaliar:</p>
                <a href="${data.reviewUrl}" class="cta-button">🌟 Avaliar Produto</a>
        </div>
        
            <div class="benefits">
                <h4 style="margin: 0 0 15px 0; color: #2d3748;">🎁 Por que avaliar?</h4>
        <ul>
                    <li>💝 Ajuda outros clientes a escolherem melhor</li>
                    <li>⚡ Leva apenas alguns segundos</li>
                    <li>🎉 Ganhe desconto na próxima compra!</li>
                    <li>📸 Compartilhe fotos e vídeos do produto</li>
        </ul>
            </div>
        
        <div class="footer">
                <p><strong>Obrigado!</strong><br>Equipe ${data.shopName} 💙</p>
                <p><small>Este email foi enviado porque você fez uma compra em nossa loja.<br>
                Se não deseja mais receber estes emails, <a href="${data.reviewUrl}&unsubscribe=${data.token}" class="unsubscribe">clique aqui</a>.</small></p>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();

    return { subject, text, html };
  }

  static generateSecureToken(): string {
    return randomBytes(32).toString("hex");
  }

  static createReviewUrl(rwsBaseUrl: string, token: string, productId: string, shop: string): string {
    // URL aponta para o RWS em vez do Minimal Reviews
    return `${rwsBaseUrl}/review?token=${token}&productId=${productId}&shop=${shop}`;
  }
}

interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
} 