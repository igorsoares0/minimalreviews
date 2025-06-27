import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function corrigirConfig() {
  try {
    console.log('🔧 Corrigindo configurações do sistema...\n');
    
    // Buscar configurações existentes
    const settings = await db.reviewSettings.findFirst();
    
    if (!settings) {
      console.log('❌ Nenhuma configuração encontrada');
      console.log('💡 Acesse http://localhost:62766/app/settings para configurar primeiro');
      return;
    }

    // Atualizar configurações
    const updated = await db.reviewSettings.update({
      where: { id: settings.id },
      data: {
        rwsBaseUrl: 'http://localhost:3002', // Porta correta do RWS
        autoSendDaysAfter: 0, // Envio imediato para testes
      }
    });

    console.log('✅ Configurações corrigidas!');
    console.log(`📍 RWS URL: ${updated.rwsBaseUrl}`);
    console.log(`⏱️  Dias após compra: ${updated.autoSendDaysAfter} (imediato)`);
    console.log(`📧 Envio automático: ${updated.autoSendEnabled ? 'Ativado' : 'Desativado'}`);
    
    console.log('\n🎯 Próximos passos:');
    console.log('1. node create-test-invite.cjs');
    console.log('2. node cron-emails.cjs');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await db.$disconnect();
  }
}

corrigirConfig(); 