async function testarWebhookPaid() {
  try {
    console.log('🧪 Testando webhook orders/paid...\n');
    
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
          title: "Produto do Webhook Paid",
          quantity: 1
        }
      ]
    };

    console.log('📦 Dados do pedido:');
    console.log(`   ID: ${webhookData.id}`);
    console.log(`   Cliente: ${webhookData.customer.first_name} ${webhookData.customer.last_name}`);
    console.log(`   Email: ${webhookData.customer.email}`);
    console.log(`   Produto: ${webhookData.line_items[0].title}`);

    console.log('\n📤 Enviando webhook orders/paid para porta 56744...');
    
    const response = await fetch(`http://localhost:56744/webhooks/orders/paid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Topic': 'orders/paid',
        'X-Shopify-Shop-Domain': 'lojatesteigor.myshopify.com',
        'X-Shopify-Hmac-Sha256': 'fake-hmac-for-test'
      },
      body: JSON.stringify(webhookData)
    });

    console.log(`   Status: ${response.status}`);
    
    const responseText = await response.text();
    console.log(`   Response: ${responseText}`);
    
    if (response.ok) {
      console.log(`\n✅ Webhook orders/paid processado com sucesso!`);
    } else {
      console.log(`\n⚠️ Webhook orders/paid teve erro no processamento`);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testarWebhookPaid(); 