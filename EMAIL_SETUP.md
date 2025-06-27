# Sistema de Email para Reviews - Guia de Configuração

## Visão Geral

O sistema de email automatiza o processo de coleta de reviews enviando convites por email para clientes após suas compras. O sistema inclui:

- ✅ Convites automáticos por email após compras
- ✅ Templates de email profissionais e responsivos
- ✅ Suporte a múltiplos provedores (SendGrid, Mailgun)
- ✅ Sistema de lembretes automáticos
- ✅ Páginas de review com links seguros
- ✅ Controle de unsubscribe
- ✅ Tracking de abertura e cliques (futuro)

## Configuração Inicial

### 1. Configurar Provedor de Email

#### Mailtrap (Para Testes - Recomendado)
1. Crie uma conta gratuita em [Mailtrap.io](https://mailtrap.io)
2. Vá para **Email Testing** → **Inboxes**
3. Crie uma nova inbox ou use a padrão
4. Clique na inbox e vá para **Settings**
5. Copie o **Inbox ID** (número da inbox)
6. Vá para **API Tokens** no menu lateral
7. Crie um novo token ou use o existente
8. Copie o **API Token**

#### SendGrid (Recomendado)
1. Crie uma conta em [SendGrid](https://sendgrid.com)
2. Vá para Settings → API Keys
3. Crie uma nova API Key com permissões de envio
4. Copie a API Key (começa com `SG.`)

#### Mailgun
1. Crie uma conta em [Mailgun](https://mailgun.com)
2. Adicione e verifique seu domínio
3. Vá para Settings → API Keys
4. Copie a Private API Key
5. Configure a variável `MAILGUN_DOMAIN` no .env

### 2. Configurar no App

1. Acesse **Configurações** no app
2. Na seção **Configurações de Email**:
   - Escolha o provedor:
     - **Mailtrap (Teste)**: Para testar emails sem enviar para clientes reais
     - **SendGrid**: Para produção
     - **Mailgun**: Para produção
   - **Para Mailtrap**:
     - Cole seu API Token
     - Cole o Inbox ID (número da inbox)
     - Configure qualquer email válido como remetente (ex: "teste@exemplo.com")
   - **Para outros provedores**:
     - Cole sua API Key
     - Configure o email do remetente (deve estar verificado no provedor)
   - Configure o nome do remetente (ex: "Sua Loja")

⚠️ **Importante**: 
- Para **Mailtrap**: Use qualquer email válido - é apenas para testes
- Para **SendGrid/Mailgun**: O email do remetente deve estar verificado no provedor

### 3. Ativar Notificações

1. Marque a opção **"Notificações por email"**
2. Salve as configurações

## Como Funciona

### Fluxo Automático

1. **Cliente faz uma compra** → Webhook `orders/paid` é acionado
2. **Sistema verifica** se cliente já avaliou o produto
3. **Convite é agendado** para 3 dias após a compra
4. **Email é enviado** automaticamente
5. **Cliente clica no link** e avalia o produto
6. **Lembretes são enviados** após 7 e 14 dias (se não respondeu)

### Processamento de Emails

Os emails são processados via cron job ou manualmente:

```bash
# Processar emails agendados
curl -X POST https://seuapp.com/api/process-emails \
  -H "Authorization: Bearer your-secret-token"
```

## Configuração do Cron Job

### Opção 1: Shopify Functions (Recomendado)
Configure um Shopify Function para processar emails automaticamente.

### Opção 2: Serviço Externo
Use serviços como:
- GitHub Actions (gratuito)
- Vercel Cron
- AWS Lambda
- Google Cloud Functions

Exemplo de configuração GitHub Actions (`.github/workflows/process-emails.yml`):

```yaml
name: Process Review Emails

on:
  schedule:
    - cron: '0 */6 * * *' # A cada 6 horas

jobs:
  process-emails:
    runs-on: ubuntu-latest
    steps:
      - name: Process emails
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/process-emails \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### Opção 3: Webhook Manual
Acesse a URL manualmente ou configure um webhook:
```
POST /api/process-emails
Authorization: Bearer your-secret-token
```

## Variáveis de Ambiente

Adicione no seu `.env`:

```env
# Para Mailgun
MAILGUN_DOMAIN=mg.yourdomain.com

# Para segurança do cron job
CRON_SECRET=your-secure-random-token
```

## Personalização de Templates

### Template Atual
- Design responsivo
- Imagem do produto
- Botão de call-to-action
- Link de unsubscribe
- Informações da loja

### Personalização Futura
- Templates por categoria de produto
- Templates por idioma
- A/B testing de templates
- Personalização de cores e fontes

## Monitoramento

### Métricas Disponíveis
- Convites criados
- Emails enviados
- Taxa de abertura (futuro)
- Taxa de cliques (futuro)
- Taxa de conversão para review

### Logs
- Webhooks processados
- Emails enviados/falhados
- Erros de configuração

## Troubleshooting

### Emails não estão sendo enviados
1. ✅ Verifique se as configurações de email estão corretas
2. ✅ Confirme se a API Key está válida
3. ✅ Verifique se o email remetente está verificado
4. ✅ Confirme se o cron job está rodando
5. ✅ Verifique os logs do app

### Clientes não estão recebendo emails
1. ✅ Verifique se o email do cliente está correto
2. ✅ Confirme se não está na caixa de spam
3. ✅ Verifique se o domínio remetente está configurado (SPF/DKIM)

### Taxa baixa de resposta
1. ✅ Teste diferentes horários de envio
2. ✅ Ajuste o timing (3, 7, 14 dias)
3. ✅ Personalize mais o template
4. ✅ Ofereça incentivos (desconto, pontos)

## Próximas Funcionalidades

- [ ] Templates personalizáveis via admin
- [ ] Segmentação por tipo de cliente
- [ ] A/B testing de templates
- [ ] Analytics avançados
- [ ] Integração com ferramentas de marketing
- [ ] SMS como canal alternativo
- [ ] Automação baseada em comportamento

## Suporte

Para dúvidas ou problemas:
1. Verifique este guia primeiro
2. Consulte os logs do app
3. Teste manualmente o endpoint de processamento
4. Entre em contato com o suporte técnico

## Custos Estimados

### SendGrid
- **Gratuito**: 100 emails/dia
- **Essentials**: $14.95/mês (40k emails)
- **Pro**: $89.95/mês (1.5M emails)

### Mailgun
- **Gratuito**: 5k emails/mês (3 meses)
- **Foundation**: $35/mês (50k emails)
- **Growth**: $80/mês (100k emails)

### Recomendação
Para lojas pequenas/médias: **SendGrid Gratuito** ou **Essentials**
Para lojas grandes: **SendGrid Pro** ou **Mailgun Growth**

## Testando com Mailtrap

### Por que usar Mailtrap?
- ✅ **Seguro**: Emails não são enviados para clientes reais
- ✅ **Gratuito**: Até 100 emails/mês na conta gratuita
- ✅ **Fácil**: Visualize emails diretamente no navegador
- ✅ **Debugging**: Veja cabeçalhos, HTML, texto e anexos
- ✅ **Sem configuração**: Não precisa verificar domínios

### Como testar
1. Configure o Mailtrap nas **Configurações** do app
2. Vá para a página **Reviews**
3. Clique em **"Enviar Convite Manual"**
4. Preencha os dados de teste
5. Clique em **"Enviar Email"**
6. Vá para sua inbox no Mailtrap.io
7. Visualize o email recebido
8. Teste o link do review

### Exemplo de configuração Mailtrap
```
Provedor: Mailtrap (Teste)
API Token: abc123def456... (seu token do Mailtrap)
Inbox ID: 123456 (ID da sua inbox)
Nome do Remetente: Minha Loja Teste
Email do Remetente: teste@exemplo.com
``` 