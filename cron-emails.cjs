#!/usr/bin/env node

/**
 * Script de Cron Job para Processamento Automático de Emails
 * 
 * Este script deve ser executado periodicamente (ex: a cada hora) para:
 * - Enviar convites de review agendados
 * - Enviar lembretes para reviews não respondidos
 * 
 * Configuração no crontab (executar a cada hora):
 * 0 * * * * cd /caminho/para/minimalreviews && node cron-emails.js
 * 
 * Ou para executar a cada 30 minutos:
 */
// Exemplo 30 em 30 minutos:
// */30 * * * * cd /caminho/para/minimalreviews && node cron-emails.js
/**
 * Versão 1.0
 */

const https = require('https');
const http = require('http');

const config = {
  // URL do Minimal Reviews (onde está a rota /api/process-emails)
  appUrl: process.env.APP_URL || 'https://minimalreviews.vercel.app',
  
  // Token de segurança (opcional, para maior segurança)
  cronSecret: process.env.CRON_SECRET || null,
  
  // Timeout em ms
  timeout: 30000
};

async function processEmails() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${config.appUrl}/api/process-emails`);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MinimalReviews-CronJob/1.0'
      },
      timeout: config.timeout
    };

    // Adicionar token de segurança se configurado
    if (config.cronSecret) {
      options.headers['Authorization'] = `Bearer ${config.cronSecret}`;
    }

    console.log(`🚀 Iniciando processamento de emails...`);
    console.log(`📡 URL: ${config.appUrl}/api/process-emails`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log('✅ Processamento concluído com sucesso!');
            console.log('📊 Resultados:', JSON.stringify(result, null, 2));
            resolve(result);
          } else {
            console.error(`❌ Erro HTTP ${res.statusCode}:`, result);
            reject(new Error(`HTTP ${res.statusCode}: ${result.error || 'Unknown error'}`));
          }
        } catch (error) {
          console.error('❌ Erro parsing JSON:', error);
          console.error('📄 Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erro na requisição:', error);
      reject(error);
    });

    req.on('timeout', () => {
      console.error('❌ Timeout na requisição');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    // Enviar dados (vazio para POST)
    req.write('{}');
    req.end();
  });
}

async function main() {
  try {
    console.log('🔄 MinimalReviews - Cron Job de Emails');
    console.log('=====================================');
    
    const result = await processEmails();
    
    // Log de sucesso
    const { invitations, reminders } = result;
    console.log('\n📈 Resumo da Execução:');
    console.log(`   📧 Convites: ${invitations.sent} enviados, ${invitations.failed} falharam`);
    console.log(`   🔔 Lembretes: ${reminders.sent} enviados, ${reminders.failed} falharam`);
    console.log(`   ⏱️  Processados: ${invitations.processed} convites pendentes`);
    
    // Exit code 0 = sucesso
    process.exit(0);
    
  } catch (error) {
    console.error('\n💥 Erro na execução do cron job:');
    console.error(error.message);
    
    // Log adicional para debug
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack trace:', error.stack);
    }
    
    // Exit code 1 = erro
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { processEmails }; 