async function testarWebhook() {
  try {
    console.log('🧪 Testando webhook orders/paid (rota de teste)...\n');
    
    const webhookData = {
      id: Date.now(),
      updated_at: new Date().toISOString(),
      customer: {
        id: 67890,
        email: "igor.srs8@hotmail.com",
        first_name: "João",
        last_name: "Silva"
      },
      line_items: [
        {
          product_id: 111,
          title: "Produto do Webhook",
          quantity: 1
        }
      ]
    };

    console.log('📦 Dados do pedido:');
    console.log(`   ID: ${webhookData.id}`);
    console.log(`   Cliente: ${webhookData.customer.first_name} ${webhookData.customer.last_name}`);
    console.log(`   Email: ${webhookData.customer.email}`);
    console.log(`   Produto: ${webhookData.line_items[0].title}`);

    // Usar rota de teste sem autenticação
    console.log('\n📤 Enviando para rota de teste...');
    
    const response = await fetch(`http://localhost:51312/api/test-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    console.log(`   Status: ${response.status}`);
    
    // Verificar se a resposta é JSON
    const contentType = response.headers.get('content-type');
    let responseData;
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
      console.log(`   Response:`, responseData);
    } else {
      const responseText = await response.text();
      console.log(`   Response (HTML/Text):`, responseText.substring(0, 200) + '...');
      
      if (response.status === 404) {
        console.log('\n❌ Rota não encontrada!');
        console.log('💡 Certifique-se que o app foi reiniciado após adicionar a nova rota');
        console.log('💡 Pare o app (Ctrl+C) e rode novamente: shopify app dev');
        return;
      }
      
      console.log('\n❌ Resposta não é JSON - possível erro interno');
      return;
    }
    
    if (response.ok && responseData.success) {
      console.log(`\n✅ Webhook processado com sucesso!`);
      console.log(`   ${responseData.message}`);
      console.log(`   Shop: ${responseData.shop}`);
      console.log(`   Email: ${responseData.customerEmail}`);
    } else {
      console.log(`\n⚠️ Webhook teve problema:`);
      console.log(`   ${responseData.message}`);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('\n💡 Possíveis soluções:');
    console.log('   1. Certifique-se que o app está rodando: shopify app dev');
    console.log('   2. Verifique se a porta está correta (62766)');
    console.log('   3. Reinicie o app se você acabou de adicionar a rota de teste');
  }
}

testarWebhook(); 