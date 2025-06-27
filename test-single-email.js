async function testeSingleEmail() {
  console.log('📧 TESTE DE EMAIL ÚNICO - EVITANDO RATE LIMIT\n');
  
  try {
    // 1. Criar um convite específico
    console.log('1️⃣ Criando convite de teste...');
    const webhookResponse = await fetch('http://localhost:62766/api/test-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: Date.now(),
        updated_at: new Date().toISOString(),
        customer: {
          id: 12345,
          email: "igor.srs8@hotmail.com", // Seu email real
          first_name: "Igor",
          last_name: "Teste"
        },
        line_items: [{
          product_id: 999,
          title: "Produto para Teste Manual",
          quantity: 1
        }]
      })
    });
    
    if (webhookResponse.ok) {
      const data = await webhookResponse.json();
      console.log(`   ✅ ${data.message}`);
    } else {
      console.log('   ❌ Erro no webhook');
      return;
    }
    
    // 2. Aguardar um pouco
    console.log('2️⃣ Aguardando 3 segundos...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 3. Processar apenas emails pendentes (não lembretes)
    console.log('3️⃣ Processando apenas convites pendentes...');
    
    // Fazer uma requisição customizada que processa apenas convites novos
    const emailResponse = await fetch('http://localhost:62766/api/process-emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onlyNewInvitations: true })
    });
    
    if (emailResponse.ok) {
      const emailData = await emailResponse.json();
      console.log(`   ✅ Resultado: ${emailData.invitations?.sent || 0} enviados, ${emailData.invitations?.failed || 0} falharam`);
      
      if (emailData.invitations?.sent > 0) {
        console.log('\n🎯 SUCESSO! Email enviado!');
        console.log('📧 Verifique seu Mailtrap para o email mais recente');
        console.log('🔗 Copie o link do email e cole no navegador');
        console.log('🌐 Deve abrir: http://localhost:3002/review?token=...');
      } else {
        console.log('\n⚠️ Nenhum email novo foi enviado');
        console.log('💡 Possíveis causas:');
        console.log('   - Convite já foi enviado antes');
        console.log('   - Configurações de email desabilitadas');
        console.log('   - Rate limit do Mailtrap');
      }
    } else {
      const errorText = await emailResponse.text();
      console.log(`   ❌ Erro: ${errorText}`);
    }
    
    // 4. Mostrar link de exemplo
    console.log('\n4️⃣ Para testar manualmente:');
    console.log('🔗 Se você tem um token, teste diretamente:');
    console.log('   http://localhost:3002/review?token=SEU_TOKEN&productId=999&shop=lojatesteigor.myshopify.com');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testeSingleEmail(); 