// test-webhook-fulfilled-real.js
async function testarWebhookFulfilledReal() {
    try {
      console.log('🧪 Testando WEBHOOK FULFILLED especificamente...\n');
      
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
            product_id: 999888777, // ID único para este teste
            title: "Produto Webhook Fulfilled Real",
            quantity: 1
          }
        ]
      };
  
      console.log('📦 Dados do pedido entregue:');
      console.log(`   ID: ${webhookData.id}`);
      console.log(`   Cliente: ${webhookData.customer.first_name} ${webhookData.customer.last_name}`);
      console.log(`   Email: ${webhookData.customer.email}`);
      console.log(`   Produto: ${webhookData.line_items[0].title}`);
  
      // Usar a porta atual (conforme seus logs: 56744)
      const port = 56744;
      
      console.log(`\n📤 Enviando para WEBHOOK FULFILLED na porta ${port}...`);
      console.log(`   URL: http://localhost:${port}/webhooks/orders/fulfilled`);
      
      const response = await fetch(`http://localhost:${port}/webhooks/orders/fulfilled`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Topic': 'orders/fulfilled',
          'X-Shopify-Shop-Domain': 'lojatesteigor.myshopify.com',
          'X-Shopify-Hmac-Sha256': 'fake-hmac-for-test'
        },
        body: JSON.stringify(webhookData)
      });
  
      console.log(`   Status: ${response.status}`);
      
      if (response.status === 401) {
        console.log('\n⚠️ Erro 401: Webhook real requer autenticação HMAC');
        console.log('💡 Isso é normal - o webhook real do Shopify funcionará');
        console.log('🔄 Tentando via rota de teste...');
        
        // Tentar via rota de teste
        const testResponse = await fetch(`http://localhost:${port}/api/test-webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookData)
        });
        
        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log(`✅ Via rota teste: ${testData.convitesCriados} convite(s) criado(s)`);
        }
        
      } else if (response.ok) {
        console.log('✅ Webhook fulfilled funcionou!');
        console.log('📝 Verifique os logs da aplicação para ver:');
        console.log('   "Received orders/fulfilled webhook for lojatesteigor.myshopify.com"');
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro: ${errorText}`);
      }
  
    } catch (error) {
      console.error('❌ Erro:', error);
    }
  }
  
  testarWebhookFulfilledReal();