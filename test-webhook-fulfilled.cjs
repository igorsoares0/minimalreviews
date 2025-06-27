// test-webhook-fulfilled.js
async function testarWebhookFulfilled() {
    try {
      console.log('🧪 Testando webhook orders/fulfilled...\n');
      
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
            title: "Produto Entregue para Review",
            quantity: 1
          }
        ]
      };
  
      console.log('📦 Dados do pedido entregue:');
      console.log(`   ID: ${webhookData.id}`);
      console.log(`   Cliente: ${webhookData.customer.first_name} ${webhookData.customer.last_name}`);
      console.log(`   Email: ${webhookData.customer.email}`);
      console.log(`   Produto: ${webhookData.line_items[0].title}`);
  
      // Usar a porta atual da sua aplicação
      const port = 56748; // Conforme o log que você compartilhou
      
      console.log(`\n📤 Enviando para rota de teste na porta ${port}...`);
      
      const response = await fetch(`http://localhost:${port}/api/test-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });
  
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log(`   Response:`, responseData);
        console.log(`\n✅ Webhook fulfilled processado com sucesso!`);
        console.log(`   Convites criados: ${responseData.convitesCriados}`);
      } else {
        const errorText = await response.text();
        console.log(`   Error: ${errorText}`);
        console.log(`\n⚠️ Webhook teve erro no processamento`);
      }
  
    } catch (error) {
      console.error('❌ Erro:', error);
    }
  }
  
  testarWebhookFulfilled();