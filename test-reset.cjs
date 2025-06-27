// test-reset.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetTest() {
  try {
    const shop = "lojatesteigor.myshopify.com";
    const email = "igor.srs8@hotmail.com";
    
    console.log('🧹 Limpando dados de teste...\n');
    
    // Remover convites existentes
    const invitations = await prisma.reviewInvitation.deleteMany({
      where: {
        shop,
        customerEmail: email
      }
    });
    
    console.log(`✅ ${invitations.count} convite(s) removido(s)`);
    
    // Verificar configurações
    const settings = await prisma.reviewSettings.findUnique({
      where: { shop }
    });
    
    console.log('\n📋 Configurações atuais:');
    console.log(`   sendEmailNotification: ${settings?.sendEmailNotification}`);
    console.log(`   emailApiKey: ${settings?.emailApiKey ? 'Configurado' : 'Não configurado'}`);
    console.log(`   emailFromAddress: ${settings?.emailFromAddress}`);
    console.log(`   autoSendDaysAfter: ${settings?.autoSendDaysAfter}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetTest();