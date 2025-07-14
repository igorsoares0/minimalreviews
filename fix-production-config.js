import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function fixProductionConfig() {
  console.log('🔧 CORRIGINDO CONFIGURAÇÕES DE PRODUÇÃO\n');
  
  try {
    // Buscar configurações existentes
    const settings = await db.reviewSettings.findFirst();
    
    if (!settings) {
      console.log('❌ Nenhuma configuração encontrada');
      console.log('💡 Acesse o admin do app para configurar primeiro');
      return;
    }

    console.log('📋 Configurações atuais:');
    console.log(`   Shop: ${settings.shop}`);
    console.log(`   RWS URL: ${settings.rwsBaseUrl}`);
    console.log(`   External API URL: ${(settings as any).externalApiUrl || 'não configurado'}`);
    
    // Atualizar configurações para produção
    const updated = await db.reviewSettings.update({
      where: { id: settings.id },
      data: {
        rwsBaseUrl: 'https://rws-three.vercel.app',
        externalApiUrl: 'https://minimalreviews.vercel.app/api',
        autoSendEnabled: false, // Desabilitar envio automático em produção por enquanto
      }
    });

    console.log('\n✅ Configurações atualizadas para produção:');
    console.log(`   RWS URL: ${updated.rwsBaseUrl}`);
    console.log(`   External API URL: ${updated.externalApiUrl}`);
    console.log(`   Auto Send: ${updated.autoSendEnabled ? 'Ativado' : 'Desativado'}`);
    
    console.log('\n🎯 Próximos passos:');
    console.log('1. Execute: node debug-production.js');
    console.log('2. Execute: node test-production-api.js');
    console.log('3. Verifique os logs de erro específicos');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await db.$disconnect();
  }
}

fixProductionConfig();