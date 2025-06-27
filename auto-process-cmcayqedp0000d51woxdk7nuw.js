// auto-process-cmcayqedp0000d51woxdk7nuw.js
console.log('🤖 Iniciando processamento automático...');

const checkAndProcess = async () => {
  try {
    const now = new Date();
    const scheduledTime = new Date('2025-06-24T20:18:18.415Z');
    
    if (now >= scheduledTime) {
      console.log('⏰ Hora do envio chegou! Processando emails...');
      
      const response = await fetch('http://localhost:56744/api/process-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📧 Resultado:', data);
        
        if (data.invitations?.sent > 0) {
          console.log('🎉 Email enviado com sucesso!');
          console.log('📧 Verifique sua inbox do Mailtrap');
        }
      }
      
      process.exit(0);
    } else {
      const remaining = Math.ceil((scheduledTime - now) / 1000);
      console.log(`⏳ Aguardando... ${remaining} segundos restantes`);
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
};

// Verificar a cada 30 segundos
setInterval(checkAndProcess, 30000);
checkAndProcess(); // Primeira verificação imediata