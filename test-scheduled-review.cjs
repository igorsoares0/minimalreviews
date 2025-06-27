// test-scheduled-review.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function agendarReviewTeste() {
  try {
    console.log('⏰ Agendando convite de review para daqui a 5 minutos...\n');
    
    const shop = "lojatesteigor.myshopify.com";
    const customerEmail = "igor.srs8@hotmail.com";
    
    // Calcular data de envio (5 minutos a partir de agora)
    const agora = new Date();
    const envioEm = new Date(agora.getTime() + 5 * 60 * 1000); // +5 minutos
    
    console.log('📅 Dados do agendamento:');
    console.log(`   Agora: ${agora.toLocaleString('pt-BR')}`);
    console.log(`   Envio agendado para: ${envioEm.toLocaleString('pt-BR')}`);
    console.log(`   Email: ${customerEmail}`);
    
    // Gerar token único
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    
    // Criar convite agendado
    const invitation = await prisma.reviewInvitation.create({
      data: {
        shop,
        orderId: `scheduled-test-${Date.now()}`,
        customerId: null,
        customerEmail,
        customerName: "João Silva (Teste Agendado)",
        productId: "gid://shopify/Product/scheduled-test",
        productTitle: "Produto Teste Agendado - 5min",
        productImage: null,
        scheduledFor: envioEm,
        token,
      },
    });
    
    console.log(`\n✅ Convite agendado com sucesso!`);
    console.log(`   ID: ${invitation.id}`);
    console.log(`   Token: ${token.substring(0, 10)}...`);
    
    console.log(`\n⏰ PRÓXIMOS PASSOS:`);
    console.log(`   1. Aguarde até ${envioEm.toLocaleString('pt-BR')}`);
    console.log(`   2. Execute: node process-scheduled-emails.js`);
    console.log(`   3. Ou aguarde o processamento automático`);
    
    // Criar script de processamento automático
    console.log(`\n🤖 Criando script de processamento automático...`);
    
    const autoProcessScript = `
// auto-process-${invitation.id}.js
console.log('🤖 Iniciando processamento automático...');

const checkAndProcess = async () => {
  try {
    const now = new Date();
    const scheduledTime = new Date('${envioEm.toISOString()}');
    
    if (now >= scheduledTime) {
      console.log('⏰ Hora do envio chegou! Processando emails...');
      
      const response = await fetch('http://localhost:56744/api/process-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📧 Resultado:', data);
        
        if (data.invitations?.sent > 0) {
          console.log('🎉 Email enviado com sucesso!');
          console.log('📧 Verifique sua inbox do Mailtrap');
        }
      }
      
      process.exit(0);
    } else {
      const remaining = Math.ceil((scheduledTime - now) / 1000);
      console.log(\`⏳ Aguardando... \${remaining} segundos restantes\`);
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
};

// Verificar a cada 30 segundos
setInterval(checkAndProcess, 30000);
checkAndProcess(); // Primeira verificação imediata
`;

    const fs = require('fs');
    const autoScriptName = `auto-process-${invitation.id}.js`;
    fs.writeFileSync(autoScriptName, autoProcessScript.trim());
    
    console.log(`\n📝 Script automático criado: ${autoScriptName}`);
    console.log(`\n🚀 Para iniciar processamento automático, execute:`);
    console.log(`   node ${autoScriptName}`);
    
    // Mostrar countdown
    console.log(`\n⏳ COUNTDOWN:`);
    let countdown = 5 * 60; // 5 minutos em segundos
    
    const countdownInterval = setInterval(() => {
      const minutes = Math.floor(countdown / 60);
      const seconds = countdown % 60;
      process.stdout.write(`\r   Tempo restante: ${minutes}:${seconds.toString().padStart(2, '0')}`);
      
      countdown--;
      
      if (countdown < 0) {
        clearInterval(countdownInterval);
        console.log(`\n\n⏰ TEMPO ESGOTADO! Execute agora:`);
        console.log(`   node process-scheduled-emails.js`);
      }
    }, 1000);
    
    // Parar countdown após 5 minutos
    setTimeout(() => {
      clearInterval(countdownInterval);
    }, 5 * 60 * 1000);
    
  } catch (error) {
    console.error('❌ Erro ao agendar:', error);
  } finally {
    // Não fechar prisma aqui para manter o countdown ativo
  }
}

agendarReviewTeste(); 