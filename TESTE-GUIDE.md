# Guia de Teste do Sistema de Envio Automático

##  Arquivos Criados

- 	est-config.js - Verifica configurações do sistema
- create-test-invite.js - Cria convite de teste
- check-status.js - Verifica status geral
- simulate-time.js - Simula tempo para lembretes
- 	est-webhook.js - Testa webhook orders/fulfilled
- un-tests.bat - Script para executar testes
- cron-emails.js - Já existia (processa emails)

##  Como Testar (Passo a Passo)

### PASSO 1: Verificar Sistema
`ash
node test-config.js
`
**Resultado esperado**: Sistema configurado ou instruções de configuração

### PASSO 2: Configurar no Admin
1. Acesse: http://localhost:3001/app/settings
2. Configure:
   -  Ativar envio automático
   - Provedor: Mailtrap
   - API Token e Inbox ID do Mailtrap
   - Dias após compra: 3 dias (para teste)

### PASSO 3: Criar Convite de Teste
1. **IMPORTANTE**: Edite create-test-invite.js
2. Substitua SEU-EMAIL@EXEMPLO.COM pelo seu email real
3. Execute:
`ash
node create-test-invite.js
`

### PASSO 4: Processar Emails
Aguarde 1 minuto e execute:
`ash
node cron-emails.js
`

### PASSO 5: Verificar Status
`ash
node check-status.js
`

### PASSO 6: Verificar Email
- Acesse sua inbox no Mailtrap
- Deve ter recebido o email de convite

### PASSO 7: Testar Lembretes (Opcional)
`ash
node simulate-time.js
node cron-emails.js
`

### PASSO 8: Testar Webhook (Opcional)
`ash
node test-webhook.js
`

##  Comandos Úteis

`ash
# Verificar tudo
node check-status.js

# Recriar convite
node create-test-invite.js

# Processar emails
node cron-emails.js

# Executar todos os testes
run-tests.bat
`

##  Problemas Comuns

**Email não chegou:**
- Verificar token/inbox ID do Mailtrap
- Verificar se sistema está ativado

**Erro de banco:**
- Executar: npx prisma db push
- Verificar se app está rodando

**Webhook falha:**
- Verificar se app está em localhost:3001
- Verificar logs do console

##  Suporte

Se algo não funcionar:
1. Execute 
ode test-config.js
2. Verifique logs do console
3. Confirme que RWS está em localhost:3002
