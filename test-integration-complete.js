async function testeIntegracaoCompleta() {
  console.log('🧪 TESTE COMPLETO DE INTEGRAÇÃO RWS + MINIMAL REVIEWS\n');
  
  try {
    // 1. Verificar se RWS está acessível na porta 3002
    console.log('1️⃣ Verificando RWS na porta 3002...');
    try {
      const rwsResponse = await fetch('http://localhost:3002');
      if (rwsResponse.ok) {
        console.log('   ✅ RWS acessível na porta 3002');
      } else {
        console.log('   ⚠️ RWS respondeu mas com erro');
      }
    } catch (error) {
      console.log('   ❌ RWS não acessível. Certifique-se que está rodando em: http://localhost:3002');
      console.log('   💡 Execute: cd ../rws && npm run dev --port 3002\n');
      return;
    }
    
    // 2. Verificar se Minimal Reviews está acessível
    console.log('2️⃣ Verificando Minimal Reviews na porta 62766...');
    try {
      const mrResponse = await fetch('http://localhost:52402/api/config');
      console.log('   ✅ Minimal Reviews acessível na porta 62766');
    } catch (error) {
      console.log('   ❌ Minimal Reviews não acessível na porta 62766');
      return;
    }
    
    // 3. Criar webhook (simular pedido)
    console.log('3️⃣ Simulando pedido via webhook...');
    const webhookResponse = await fetch('http://localhost:52402/api/test-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: Date.now(),
        updated_at: new Date().toISOString(),
        customer: {
          id: 67890,
          email: "igor.srs8@hotmail.com",
          first_name: "João",
          last_name: "Silva"
        },
        line_items: [{
          product_id: 111,
          title: "Produto Teste Integração Completa",
          quantity: 1
        }]
      })
    });
    
    if (webhookResponse.ok) {
      const webhookData = await webhookResponse.json();
      console.log(`   ✅ ${webhookData.message}`);
    } else {
      console.log('   ❌ Erro no webhook');
      return;
    }
    
    // 4. Aguardar processamento
    console.log('4️⃣ Aguardando processamento...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 5. Processar emails
    console.log('5️⃣ Processando emails...');
    const emailResponse = await fetch('http://localhost:52402/api/process-emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    });
    
    if (emailResponse.ok) {
      const emailData = await emailResponse.json();
      console.log(`   ✅ Emails processados: ${emailData.invitations?.sent || 0} enviados`);
      
      if (emailData.invitations?.sent > 0) {
        console.log('\n🎯 SUCESSO! Email de convite enviado!');
        console.log('📧 Verifique seu email (Mailtrap) para o convite');
        console.log('🔗 Clique no link do email para testar o RWS');
      } else {
        console.log('\n⚠️ Nenhum email foi enviado. Verifique as configurações.');
      }
    } else {
      const errorText = await emailResponse.text();
      console.log(`   ❌ Erro no processamento de emails: ${errorText}`);
    }
    
    // 6. Mostrar status
    console.log('\n6️⃣ Status final:');
    console.log('   📊 Para ver detalhes: node check-status.cjs');
    console.log('   🔧 Para reconfigurar: node fix-config.js');
    
    console.log('\n🔄 FLUXO COMPLETO:');
    console.log('   1. Pedido criado → Convite agendado ✅');
    console.log('   2. Email enviado → Cliente recebe link ✅');
    console.log('   3. Cliente clica → Vai para RWS (http://localhost:3002)');
    console.log('   4. Cliente preenche review → Salva no RWS');
    console.log('   5. Minimal Reviews sincroniza → Exibe na loja');
    
  } catch (error) {
    console.error('❌ Erro no teste de integração:', error.message);
  }
}

testeIntegracaoCompleta(); 