// check-auto-send.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAutoSend() {
  try {
    const shop = "lojatesteigor.myshopify.com";
    
    console.log('🔍 Verificando configurações de envio automático...\n');
    
    const settings = await prisma.reviewSettings.findUnique({
      where: { shop }
    });

    if (!settings) {
      console.log('❌ Configurações não encontradas para a loja');
      return;
    }

    console.log('📋 Configurações atuais:');
    console.log(`   autoSendEnabled: ${settings.autoSendEnabled}`);
    console.log(`   autoSendDaysAfter: ${settings.autoSendDaysAfter}`);
    console.log(`   sendEmailNotification: ${settings.sendEmailNotification}`);
    console.log(`   emailApiKey: ${settings.emailApiKey ? 'Configurado' : 'Não configurado'}`);
    console.log(`   emailFromAddress: ${settings.emailFromAddress || 'Não configurado'}`);

    if (!settings.autoSendEnabled) {
      console.log('\n⚠️ Envio automático está DESABILITADO');
      console.log('💡 Habilitando envio automático...');
      
      await prisma.reviewSettings.update({
        where: { shop },
        data: { 
          autoSendEnabled: true,
          autoSendDaysAfter: 3 // 3 dias após entrega
        }
      });
      
      console.log('✅ Envio automático habilitado!');
    } else {
      console.log('\n✅ Envio automático já está habilitado');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAutoSend();