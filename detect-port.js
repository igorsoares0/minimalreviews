async function detectarPorta() {
  console.log('🔍 Detectando porta do Minimal Reviews...\n');
  
  // Portas possíveis
  const portas = [63732, 62766, 3001, 8080, 8081];
  
  for (const porta of portas) {
    try {
      console.log(`🔍 Testando porta ${porta}...`);
      
      // Testar rota de config
      const response = await fetch(`http://localhost:${porta}/api/config`, {
        method: 'GET',
        timeout: 3000
      });
      
      if (response.ok || response.status === 405) {
        console.log(`✅ Minimal Reviews encontrado na porta ${porta}`);
        
        // Testar rota de process-emails
        try {
          const processResponse = await fetch(`http://localhost:${porta}/api/process-emails`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{}'
          });
          
          if (processResponse.ok) {
            console.log(`✅ Rota /api/process-emails funciona na porta ${porta}`);
            console.log(`\n🎯 Use esta porta: ${porta}`);
            console.log(`📝 Atualize cron-emails.cjs para usar: http://localhost:${porta}`);
            return porta;
          } else {
            console.log(`⚠️ Rota /api/process-emails não funciona na porta ${porta} (status: ${processResponse.status})`);
          }
        } catch (error) {
          console.log(`⚠️ Erro ao testar /api/process-emails na porta ${porta}`);
        }
      }
    } catch (error) {
      console.log(`❌ Porta ${porta} não está acessível`);
    }
  }
  
  console.log('\n❌ Nenhuma porta válida encontrada');
  console.log('💡 Certifique-se que o Minimal Reviews está rodando com: shopify app dev');
}

detectarPorta(); 