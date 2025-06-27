// setup-dual-system.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupDualSystem() {
  try {
    const shop = "lojatesteigor.myshopify.com";
    
    console.log('🔧 Configurando sistema duplo de reviews...\n');
    
    // Buscar configurações atuais
    let settings = await prisma.reviewSettings.findUnique({
      where: { shop }
    });

    if (!settings) {
      console.log('❌ Configurações não encontradas para a loja');
      return;
    }

    console.log('📋 Configurações ANTES da mudança:');
    console.log(`   sendEmailNotification (manual): ${settings.sendEmailNotification}`);
    console.log(`   autoSendEnabled (automático): ${settings.autoSendEnabled}`);
    console.log(`   autoSendDaysAfter: ${settings.autoSendDaysAfter}`);
    console.log(`   emailApiKey: ${settings.emailApiKey ? 'Configurado' : 'Não configurado'}`);
    console.log(`   emailFromAddress: ${settings.emailFromAddress}`);

    // Atualizar configurações para habilitar AMBOS os sistemas
    const updatedSettings = await prisma.reviewSettings.update({
      where: { shop },
      data: {
        // Sistema MANUAL - para envios via interface admin
        sendEmailNotification: true,
        
        // Sistema AUTOMÁTICO - para envios via webhook
        autoSendEnabled: true,
        autoSendDaysAfter: 3, // Enviar 3 dias após entrega
      }
    });

    console.log('\n✅ Configurações APÓS a mudança:');
    console.log(`   sendEmailNotification (manual): ${updatedSettings.sendEmailNotification}`);
    console.log(`   autoSendEnabled (automático): ${updatedSettings.autoSendEnabled}`);
    console.log(`   autoSendDaysAfter: ${updatedSettings.autoSendDaysAfter}`);

    console.log('\n🎉 SISTEMA DUPLO CONFIGURADO COM SUCESSO!');
    console.log('\n📧 COMO FUNCIONA AGORA:');
    console.log('   1. MANUAL: Via interface admin - usa sendEmailNotification');
    console.log('   2. AUTOMÁTICO: Via webhook fulfilled - usa autoSendEnabled');
    console.log('   3. INDEPENDENTES: Você pode habilitar/desabilitar cada um separadamente');

    console.log('\n🧪 TESTE RECOMENDADO:');
    console.log('   1. Processe um pedido no admin Shopify');
    console.log('   2. Verifique os logs do webhook');
    console.log('   3. Execute: node check-invitations.cjs');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupDualSystem(); 