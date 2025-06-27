# Sistema de Envio Automático de Reviews

Este documento explica como configurar e usar o sistema de envio automático de convites de review no Minimal Reviews.

## 📋 Visão Geral

O sistema permite enviar automaticamente convites de review para clientes após a entrega de produtos, com lembretes opcionais para quem não respondeu.

### Fluxo do Sistema

1. **Pedido Entregue** → Webhook `orders/fulfilled` é acionado
2. **Agendamento** → Convites são agendados para X dias após a entrega
3. **Processamento** → Cron job processa convites agendados
4. **Envio** → Emails são enviados via RWS
5. **Lembretes** → Lembretes automáticos para não respondidos

## 🔧 Configuração

### 1. Configurações da Loja

Acesse **Configurações → Envio Automático** no admin:

- ✅ **Ativar envio automático**: Liga/desliga o sistema
- 📅 **Dias após a compra**: Quando enviar (3, 7, 14, 21, 30 dias)
- 🔔 **Número de lembretes**: Quantos lembretes enviar (0-3)
- ⏰ **Dias entre lembretes**: Intervalo entre lembretes (3, 7, 14 dias)

### 2. Configuração de Email

Configure um provedor de email em **Configurações → Email**:

- **Mailtrap** (para testes)
- **SendGrid** (produção)
- **Mailgun** (produção)

### 3. Webhook do Shopify

O webhook `orders/fulfilled` deve estar configurado automaticamente. Verifique em:
- Shopify Admin → Settings → Notifications → Webhooks
- Endpoint: `https://seuapp.com/webhooks/orders/fulfilled`

### 4. Cron Job

Configure o cron job para processar emails periodicamente:

```bash
# Executar a cada hora
0 * * * * cd /caminho/para/minimalreviews && node cron-emails.js

# Ou a cada 30 minutos
*/30 * * * * cd /caminho/para/minimalreviews && node cron-emails.js
```

#### Variáveis de Ambiente para Cron

```bash
# .env
APP_URL=https://seuapp.com
CRON_SECRET=seu-token-secreto-opcional
```

## 🔄 Como Funciona

### Webhook Orders/Fulfilled

Quando um pedido é marcado como "fulfilled" no Shopify:

1. **Verifica configurações** da loja
2. **Calcula data de envio** (entrega + dias configurados)
3. **Cria convites** para cada produto do pedido
4. **Armazena no banco** com token único

### Processamento de Emails

O cron job (`api/process-emails`) executa:

1. **Busca convites pendentes** (scheduledFor <= agora)
2. **Envia emails** via provedor configurado
3. **Marca como enviados** (sentAt = agora)
4. **Processa lembretes** para não respondidos

### Sistema de Lembretes

Para convites não respondidos:

1. **Calcula próximo lembrete** (dias * número do lembrete)
2. **Verifica se deve enviar** (tempo decorrido >= tempo necessário)
3. **Envia lembrete** com contador incremental
4. **Para quando atinge** o máximo configurado

## 🗄️ Estrutura do Banco

### ReviewSettings (novos campos)

```sql
autoSendEnabled       BOOLEAN DEFAULT false
autoSendDaysAfter     INTEGER DEFAULT 7
autoSendMaxReminders  INTEGER DEFAULT 2
autoSendReminderDays  INTEGER DEFAULT 7
```

### ReviewInvitation

```sql
id            TEXT PRIMARY KEY
shop          TEXT NOT NULL
orderId       TEXT NOT NULL
customerId    TEXT
customerEmail TEXT NOT NULL
customerName  TEXT
productId     TEXT NOT NULL
productTitle  TEXT NOT NULL
productImage  TEXT
scheduledFor  DATETIME NOT NULL
sentAt        DATETIME
opened        BOOLEAN DEFAULT false
clicked       BOOLEAN DEFAULT false
responded     BOOLEAN DEFAULT false
reminderCount INTEGER DEFAULT 0
token         TEXT UNIQUE NOT NULL
```

## 🚀 Uso Manual

### Testar Processamento

```bash
# Via cron script
node cron-emails.js

# Via API diretamente
curl -X POST http://localhost:3001/api/process-emails
```

### Verificar Status

```bash
# Convites pendentes
SELECT COUNT(*) FROM ReviewInvitation 
WHERE sentAt IS NULL AND scheduledFor <= datetime('now');

# Lembretes pendentes
SELECT COUNT(*) FROM ReviewInvitation 
WHERE sentAt IS NOT NULL 
  AND responded = false 
  AND reminderCount < (SELECT autoSendMaxReminders FROM ReviewSettings WHERE shop = 'loja.myshopify.com');
```

## 📊 Monitoramento

### Logs Importantes

- 📦 **Webhook**: `Pedido entregue: {orderId}`
- 📅 **Agendamento**: `Agendando envios para {data}`
- 📧 **Processamento**: `Encontrados X convites pendentes`
- ✅ **Sucesso**: `Email enviado para {email}`
- ❌ **Erro**: `Falha ao enviar email para {email}`

### Métricas

O endpoint `/api/process-emails` retorna:

```json
{
  "success": true,
  "invitations": {
    "sent": 5,
    "failed": 0,
    "processed": 5
  },
  "reminders": {
    "sent": 2,
    "failed": 0
  }
}
```

## 🔒 Segurança

- **Tokens únicos** para cada convite
- **Verificação de loja** em todos os endpoints
- **Rate limiting** (50 emails por execução)
- **Token de cron** opcional para maior segurança

## 🐛 Troubleshooting

### Emails não são enviados

1. ✅ Verificar se `autoSendEnabled = true`
2. ✅ Verificar configurações de email
3. ✅ Verificar se cron job está rodando
4. ✅ Verificar logs de erro

### Webhooks não funcionam

1. ✅ Verificar URL do webhook no Shopify
2. ✅ Verificar se app tem permissões
3. ✅ Verificar logs do webhook

### Lembretes não são enviados

1. ✅ Verificar `autoSendMaxReminders > 0`
2. ✅ Verificar se tempo suficiente passou
3. ✅ Verificar se convite não foi respondido

## 📈 Otimizações Futuras

- [ ] Dashboard de métricas
- [ ] Segmentação de clientes
- [ ] Templates de email personalizáveis
- [ ] Integração com analytics
- [ ] Retry automático para falhas
- [ ] Unsubscribe automático

## 🆘 Suporte

Para problemas ou dúvidas:

1. Verificar logs da aplicação
2. Testar manualmente com `node cron-emails.js`
3. Verificar configurações no admin
4. Consultar documentação do provedor de email 