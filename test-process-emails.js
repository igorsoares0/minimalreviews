// test-process-emails.js
async function testarProcessamentoEmails() {
    try {
      console.log('📧 Testando processamento de emails...\n');
      
      // Use a porta atual da sua aplicação
      const port = 56744; // Atualize conforme necessário
      
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
        console.log(`   Emails enviados: ${responseData.invitations?.sent || 0}`);
        console.log(`   Emails falharam: ${responseData.invitations?.failed || 0}`);
        console.log(`   Total processados: ${responseData.invitations?.processed || 0}`);
        
        if (responseData.invitations?.sent > 0) {
          console.log('\n🎉 SUCESSO! Emails foram enviados.');
          console.log('📧 Verifique sua inbox do Mailtrap');
        } else {
          console.log('\n⚠️ Nenhum email foi enviado. Verifique se há convites agendados.');
        }
      } else {
        const errorText = await response.text();
        console.log(`   Error: ${errorText}`);
      }
  
    } catch (error) {
      console.error('❌ Erro:', error);
    }
  }
  
  testarProcessamentoEmails();