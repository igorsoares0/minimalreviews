/**
 * Script para atualizar as configurações do Mailtrap no banco de dados
 * Isso permitirá que o sistema de envio automático de emails funcione
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configurações do Mailtrap (substitua pelos valores reais)
const MAILTRAP_TOKEN = '806ee83667ade5cab7d8899d99a44c1d'; // Substitua pelo seu token
const MAILTRAP_INBOX_ID = '3821300'; // Substitua pelo seu inbox ID

async function updateMailtrapConfig() {
  try {
    console.log('🔍 Buscando lojas para atualizar...');
    
    // Buscar todas as lojas que usam Mailtrap
    const stores = await prisma.reviewSettings.findMany({
      where: {
        emailProvider: 'mailtrap'
      }
    });
    
    console.log(`📊 Encontradas ${stores.length} lojas usando Mailtrap`);
    
    if (stores.length === 0) {
      console.log('⚠️ Nenhuma loja usando Mailtrap encontrada');
      return;
    }
    
    // Atualizar cada loja
    for (const store of stores) {
      console.log(`\n🔄 Atualizando loja: ${store.shop}`);
      
      await prisma.reviewSettings.update({
        where: { shop: store.shop },
        data: {
          mailtrapToken: MAILTRAP_TOKEN,
          mailtrapInboxId: MAILTRAP_INBOX_ID
        }
      });
      
      console.log(`✅ Loja ${store.shop} atualizada com sucesso!`);
    }
    
    console.log('\n🎉 Todas as lojas foram atualizadas com as configurações do Mailtrap!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar configurações:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateMailtrapConfig();