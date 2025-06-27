// test-auto-webhook.js
async function testarWebhookAutomatico() {
  try {
    console.log('🤖 Testando sistema AUTOMÁTICO via webhook...\n');
    
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
          product_id: 999888777,
          title: "Produto Automático Webhook",
          quantity: 1
        }
      ]
    };

    console.log('📦 Dados do pedido processado:');
    console.log(`   ID: ${webhookData.id}`);
    console.log(`   Cliente: ${webhookData.customer.first_name} ${webhookData.customer.last_name}`);
    console.log(`   Email: ${webhookData.customer.email}`);
    console.log(`   Produto: ${webhookData.line_items[0].title}`);

    // Detectar porta atual
    const port = process.env.PORT || 56744;
    
    console.log(`\n📤 Enviando para webhook AUTOMÁTICO na porta ${port}...`);
    console.log(`   URL: http://localhost:${port}/api/test-webhook`);

    const response = await fetch(`http://localhost:${port}/api/test-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Shop-Domain': 'lojatesteigor.myshopify.com',
        'X-Shopify-Topic': 'orders/fulfilled'
      },
      body: JSON.stringify(webhookData)
    });

    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const responseData = await response.json();
      console.log(`   Response:`, responseData);
      
      console.log(`\n📊 Resultados:`);
      console.log(`   ✅ Webhook processado com sucesso`);
      console.log(`   🎯 Convites criados: ${responseData.convitesCriados || 0}`);
      
      if (responseData.convitesCriados > 0) {
        console.log(`\n🎉 SUCESSO! Sistema automático funcionando!`);
        console.log(`📧 Próximos passos:`);
        console.log(`   1. Aguarde ${responseData.daysAfter || 3} dias`);
        console.log(`   2. Ou execute: node process-scheduled-emails.js`);
        console.log(`   3. Verifique: node check-invitations.cjs`);
      } else {
        console.log(`\n⚠️ Nenhum convite criado. Possíveis motivos:`);
        console.log(`   - autoSendEnabled está desabilitado`);
        console.log(`   - Convite já existe para este cliente/produto`);
        console.log(`   - Configurações de email incompletas`);
        console.log(`\n🔧 Execute: node check-dual-system.js`);
      }
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Erro: ${errorText}`);
      
      console.log(`\n🔧 Possíveis soluções:`);
      console.log(`   1. Verifique se a aplicação está rodando`);
      console.log(`   2. Execute: node setup-dual-system.js`);
      console.log(`   3. Verifique: node check-dual-system.js`);
    }

  } catch (error) {
    console.error('\n❌ Erro na requisição:', error.message);
    console.log('\n🔧 Verifique se a aplicação está rodando na porta correta');
  }
}

testarWebhookAutomatico(); 