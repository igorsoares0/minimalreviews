// check-dual-system.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDualSystem() {
  try {
    const shop = "lojatesteigor.myshopify.com";
    
    console.log('🔍 Verificando status do sistema duplo...\n');
    
    // Buscar configurações atuais
    const settings = await prisma.reviewSettings.findUnique({
      where: { shop }
    });

    if (!settings) {
      console.log('❌ Configurações não encontradas para a loja');
      return;
    }

    console.log('📊 STATUS DOS SISTEMAS:');
    console.log('=' .repeat(50));
    
    // Sistema Manual
    console.log('\n📧 SISTEMA MANUAL (Interface Admin):');
    console.log(`   Status: ${settings.sendEmailNotification ? '✅ HABILITADO' : '❌ DESABILITADO'}`);
    console.log(`   Usado para: Envios manuais via interface`);
    
    // Sistema Automático
    console.log('\n🤖 SISTEMA AUTOMÁTICO (Webhook):');
    console.log(`   Status: ${settings.autoSendEnabled ? '✅ HABILITADO' : '❌ DESABILITADO'}`);
    console.log(`   Dias após entrega: ${settings.autoSendDaysAfter || 3}`);
    console.log(`   Usado para: Envios via webhook orders/fulfilled`);
    
    // Configurações de Email
    console.log('\n📮 CONFIGURAÇÕES DE EMAIL:');
    console.log(`   API Key: ${settings.emailApiKey ? '✅ Configurado' : '❌ Não configurado'}`);
    console.log(`   From Address: ${settings.emailFromAddress || '❌ Não configurado'}`);
    console.log(`   RWS Base URL: ${settings.rwsBaseUrl || '❌ Não configurado'}`);

    // Verificar convites recentes
    console.log('\n📋 CONVITES RECENTES (últimas 24h):');
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentInvitations = await prisma.reviewInvitation.findMany({
      where: {
        shop,
        createdAt: {
          gte: oneDayAgo
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    if (recentInvitations.length === 0) {
      console.log('   Nenhum convite criado nas últimas 24h');
    } else {
      recentInvitations.forEach((invitation, index) => {
        console.log(`   ${index + 1}. ${invitation.productTitle}`);
        console.log(`      Email: ${invitation.customerEmail}`);
        console.log(`      Agendado: ${invitation.scheduledFor.toLocaleString('pt-BR')}`);
        console.log(`      Enviado: ${invitation.sent ? 'Sim' : 'Não'}`);
        console.log(`      Respondido: ${invitation.responded ? 'Sim' : 'Não'}`);
      });
    }

    // Resumo
    console.log('\n🎯 RESUMO:');
    if (settings.sendEmailNotification && settings.autoSendEnabled) {
      console.log('   ✅ SISTEMA DUPLO ATIVO - Manual + Automático');
    } else if (settings.sendEmailNotification) {
      console.log('   📧 Apenas sistema MANUAL ativo');
    } else if (settings.autoSendEnabled) {
      console.log('   🤖 Apenas sistema AUTOMÁTICO ativo');
    } else {
      console.log('   ❌ Ambos os sistemas DESABILITADOS');
    }

    console.log('\n💡 PRÓXIMOS PASSOS:');
    if (!settings.sendEmailNotification && !settings.autoSendEnabled) {
      console.log('   Execute: node setup-dual-system.js');
    } else {
      console.log('   1. Teste envio manual via interface');
      console.log('   2. Processe um pedido para testar automático');
      console.log('   3. Execute: node check-invitations.cjs');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDualSystem(); 