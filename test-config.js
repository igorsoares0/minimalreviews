import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function verificarConfig() {
  try {
    console.log(' Verificando configurações do sistema...\n');
    
    const settings = await db.reviewSettings.findFirst();
    
    if (!settings) {
      console.log(' Nenhuma configuração encontrada');
      console.log(' Acesse http://localhost:3001/app/settings para configurar');
      return;
    }

    console.log(' Configurações atuais:');
    console.log(`  Envio automático: ${settings.autoSendEnabled ? 'Ativado' : 'Desativado'}`);
    console.log(`  Dias após compra: ${settings.autoSendDaysAfter}`);
    console.log(`  Máx. lembretes: ${settings.autoSendMaxReminders}`);
    console.log(`  Dias entre lembretes: ${settings.autoSendReminderDays}`);
    console.log(`  Provedor: ${settings.emailProvider}`);
    console.log(`  Email: ${settings.emailFromAddress || 'não configurado'}`);
    console.log(`  RWS URL: ${settings.rwsBaseUrl}`);

    console.log('\n Status geral:');
    if (settings.autoSendEnabled && settings.emailProvider === 'mailtrap') {
      console.log(' Sistema configurado corretamente para testes!');
    } else if (!settings.autoSendEnabled) {
      console.log('  Envio automático está DESATIVADO');
    } else {
      console.log('  Verifique as configurações de email');
    }

  } catch (error) {
    console.error(' Erro:', error);
  } finally {
    await db.$disconnect();
  }
}

verificarConfig();
