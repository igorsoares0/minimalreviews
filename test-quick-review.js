// test-quick-review.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testeRapido() {
  try {
    console.log('🚀 TESTE RÁPIDO: Agendando review para daqui a 1 minuto...\n');
    
    const shop = "lojatesteigor.myshopify.com";
    const customerEmail = "igor.srs8@hotmail.com";
    
    // Calcular data de envio (1 minuto a partir de agora)
    const agora = new Date();
    const envioEm = new Date(agora.getTime() + 1 * 60 * 1000); // +1 minuto
    
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
        orderId: `quick-test-${Date.now()}`,
        customerId: null,
        customerEmail,
        customerName: "João Silva (Teste Rápido)",
        productId: "gid://shopify/Product/quick-test",
        productTitle: "Produto Teste Rápido - 1min",
        productImage: null,
        scheduledFor: envioEm,
        token,
      },
    });
    
    console.log(`\n✅ Convite agendado com sucesso!`);
    console.log(`   ID: ${invitation.id}`);
    console.log(`   Token: ${token.substring(0, 10)}...`);
    
    // Countdown de 1 minuto
    console.log(`\n⏳ COUNTDOWN DE 1 MINUTO:`);
    let countdown = 60; // 1 minuto em segundos
    
    const countdownInterval = setInterval(() => {
      process.stdout.write(`\r   Tempo restante: ${countdown} segundos`);
      countdown--;
      
      if (countdown < 0) {
        clearInterval(countdownInterval);
        console.log(`\n\n⏰ TEMPO ESGOTADO!`);
        console.log(`\n🚀 Processando emails automaticamente...`);
        
        // Processar emails automaticamente
        processarEmails();
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Erro ao agendar:', error);
  }
}

async function processarEmails() {
  try {
    const port = 56744; // Atualize se necessário
    
    const response = await fetch(`http://localhost:${port}/api/process-emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n📧 Resultado do processamento:', data);
      
      if (data.invitations?.sent > 0) {
        console.log('\n🎉 SUCESSO! Email enviado!');
        console.log('📧 Verifique sua inbox do Mailtrap');
      } else {
        console.log('\n⚠️ Nenhum email foi enviado');
        console.log('💡 Tente executar: node process-scheduled-emails.js');
      }
    } else {
      console.log('\n❌ Erro no processamento');
    }
    
  } catch (error) {
    console.error('❌ Erro no processamento:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

testeRapido(); 