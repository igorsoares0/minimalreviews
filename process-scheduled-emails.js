// process-scheduled-emails.js
async function processarEmailsAgendados() {
  try {
    console.log('📧 Processando emails agendados...\n');
    
    // Use a porta atual da sua aplicação
    const port = 56744; // Atualize se necessário
    
    console.log(`📤 Chamando API de processamento na porta ${port}...`);
    
    const response = await fetch(`http://localhost:${port}/api/process-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const responseData = await response.json();
      console.log(`   Response:`, responseData);
      
      console.log(`\n📊 Resultados:`);
      console.log(`   📧 Convites enviados: ${responseData.invitations?.sent || 0}`);
      console.log(`   ❌ Convites falharam: ${responseData.invitations?.failed || 0}`);
      console.log(`   📋 Total processados: ${responseData.invitations?.processed || 0}`);
      console.log(`   🔔 Lembretes enviados: ${responseData.reminders?.sent || 0}`);
      console.log(`   ⚠️ Lembretes falharam: ${responseData.reminders?.failed || 0}`);
      
      if (responseData.invitations?.sent > 0) {
        console.log('\n🎉 SUCESSO! Emails foram enviados.');
        console.log('📧 Verifique sua inbox do Mailtrap');
        
        // Verificar convites após envio
        console.log('\n🔍 Verificando status dos convites...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Chamar script de verificação se existir
        try {
          const { exec } = require('child_process');
          exec('node check-invitations.cjs', (error, stdout, stderr) => {
            if (!error) {
              console.log('\n📋 Status atualizado dos convites:');
              console.log(stdout);
            }
          });
        } catch (e) {
          console.log('   (Para ver status detalhado, execute: node check-invitations.cjs)');
        }
        
      } else if (responseData.invitations?.processed === 0) {
        console.log('\n⏰ Nenhum convite estava pronto para envio ainda.');
        console.log('   Verifique se há convites agendados para agora ou antes.');
      } else {
        console.log('\n⚠️ Convites foram processados mas nenhum email foi enviado.');
        console.log('   Verifique as configurações de email.');
      }
    } else {
      const errorText = await response.text();
      console.log(`   Error: ${errorText}`);
      console.log(`\n❌ Erro no processamento de emails`);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

processarEmailsAgendados(); 