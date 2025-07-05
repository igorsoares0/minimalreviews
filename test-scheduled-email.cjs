/**
 * Script para testar o envio automático de emails em produção
 * Este script cria um convite de review agendado para 5 minutos no futuro
 */

console.log('Iniciando script de teste de email...');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestInvitation() {
  try {
    // Listar todas as lojas para debug
    console.log('🔍 Buscando lojas disponíveis...');
    const allSettings = await prisma.reviewSettings.findMany();
    
    console.log(`📊 Encontradas ${allSettings.length} lojas no total`);
    
    if (allSettings.length > 0) {
      console.log('\n📋 Detalhes das configurações:');
      allSettings.forEach((s, i) => {
        console.log(`\n🏪 Loja ${i+1}: ${s.shop}`);
        console.log(`   📧 Email ativado: ${s.sendEmailNotification ? '✅' : '❌'}`);
        console.log(`   🔑 API Key: ${s.emailApiKey ? '✅' : '❌'}`);
        console.log(`   📤 Email From: ${s.emailFromAddress || 'não definido'}`);
        console.log(`   📦 Provider: ${s.emailProvider || 'não definido'}`);
      });
    }
    
    // Pegar a primeira loja, mesmo sem todas as configurações
    const settings = allSettings.length > 0 ? allSettings[0] : null;
    
    if (!settings) {
      console.error('❌ Nenhuma loja encontrada no banco de dados');
      return;
    }
    
    // Calcular data 5 minutos no futuro
    const scheduledFor = new Date();
    scheduledFor.setMinutes(scheduledFor.getMinutes() + 5);
    
    // Gerar token único
    const token = require('crypto').randomBytes(32).toString('hex');
    
    console.log('\n🔄 Criando convite de teste para a loja:', settings.shop);
    
    // Criar convite de teste
    const invitation = await prisma.reviewInvitation.create({
      data: {
        shop: settings.shop,
        customerEmail: 'teste@example.com', // Email de teste
        customerName: 'Cliente Teste',
        orderId: 'test-order-' + Date.now(),
        productId: 'gid://shopify/Product/123456789',
        productTitle: 'Produto de Teste para Email Automático',
        productImage: 'https://via.placeholder.com/150',
        scheduledFor: scheduledFor,
        token: token,
        sentAt: null,
        responded: false,
        reminderCount: 0
      }
    });
    
    console.log('✅ Convite de teste criado com sucesso!');
    console.log(`📅 Agendado para: ${scheduledFor.toISOString()}`);
    console.log(`🏪 Loja: ${settings.shop}`);
    console.log(`📧 Email: teste@example.com`);
    console.log(`🔑 Token: ${token.substring(0, 10)}...`);
    console.log('\n⏰ O email deve ser enviado automaticamente em 5 minutos.');
    console.log('📝 Verifique os logs da Vercel ou execute o script cron-emails.cjs manualmente após esse tempo.');
    console.log('\n⚠️ AVISO: A loja selecionada pode não ter todas as configurações de email necessárias.');
    console.log('   Se o email não for enviado, verifique as configurações da loja no banco de dados.');
    
  } catch (error) {
    console.error('❌ Erro ao criar convite de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestInvitation();
