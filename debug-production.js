import fetch from 'node-fetch';

async function debugProduction() {
  console.log('�� DIAGNÓSTICO DE PRODUÇÃO: MINIMAL REVIEWS + RWS\n');
  
  const config = {
    minimalReviewsUrl: 'https://minimalreviews.vercel.app',
    rwsUrl: 'https://rws-three.vercel.app',
    testShop: 'lojatesteigor.myshopify.com',
    testProductId: 'gid://shopify/Product/123456789'
  };
  
  try {
    // 1. Testar Minimal Reviews
    console.log('1️⃣ TESTANDO MINIMAL REVIEWS');
    console.log('============================');
    
    const mrEndpoints = [
      `${config.minimalReviewsUrl}/api/reviews?shop=${config.testShop}&productId=${config.testProductId}`,
      `${config.minimalReviewsUrl}/api/config?shop=${config.testShop}`,
      `${config.minimalReviewsUrl}/api/test-rws`
    ];
    
    for (const endpoint of mrEndpoints) {
      try {
        console.log(`📡 Testando: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        });
        
        console.log(`   Status: ${response.status}`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('   ✅ Resposta OK');
          if (data.reviews) {
            console.log(`   Reviews: ${data.reviews.length}`);
          }
          if (data.stats) {
            console.log(`   Stats: ${JSON.stringify(data.stats)}`);
          }
        } else {
          const text = await response.text();
          console.log(`   ❌ Erro: ${text.substring(0, 200)}`);
        }
      } catch (error) {
        console.log(`   ❌ Erro de conexão: ${error.message}`);
      }
      console.log('');
    }
    
    // 2. Testar RWS
    console.log('2️⃣ TESTANDO RWS');
    console.log('===============');
    
    const rwsEndpoints = [
      `${config.rwsUrl}/api/reviews`,
      `${config.rwsUrl}/api/reviews?shopifyShop=${config.testShop}`,
      `${config.rwsUrl}/api/reviews?productId=test-product-123`
    ];
    
    for (const endpoint of rwsEndpoints) {
      try {
        console.log(`📡 Testando: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        });
        
        console.log(`   Status: ${response.status}`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('   ✅ Resposta OK');
          console.log(`   Reviews: ${Array.isArray(data) ? data.length : 'N/A'}`);
          
          if (Array.isArray(data) && data.length > 0) {
            console.log(`   Primeira review: ${JSON.stringify(data[0], null, 2)}`);
          }
        } else {
          const text = await response.text();
          console.log(`   ❌ Erro: ${text.substring(0, 200)}`);
        }
      } catch (error) {
        console.log(`   ❌ Erro de conexão: ${error.message}`);
      }
      console.log('');
    }
    
    // 3. Testar integração entre sistemas
    console.log('3️⃣ TESTANDO INTEGRAÇÃO');
    console.log('=======================');
    
    // Testar criação de review no RWS via Minimal Reviews
    try {
      console.log('📝 Testando criação de review via integração...');
      
      const createResponse = await fetch(`${config.rwsUrl}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: 5,
          comment: 'Teste de integração em produção',
          productId: 'test-product-' + Date.now(),
          customerName: 'Cliente Teste Produção',
          customerEmail: 'teste@exemplo.com',
          shopifyShop: config.testShop,
          shopifyProductId: config.testProductId
        }),
        timeout: 15000
      });
      
      console.log(`   Status: ${createResponse.status}`);
      
      if (createResponse.ok) {
        const data = await createResponse.json();
        console.log('   ✅ Review criada com sucesso');
        console.log(`   ID: ${data.id}`);
      } else {
        const text = await createResponse.text();
        console.log(`   ❌ Erro: ${text.substring(0, 200)}`);
      }
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    }
    
    // 4. Verificar configurações de produção
    console.log('\n4️⃣ CONFIGURAÇÕES DE PRODUÇÃO');
    console.log('===============================');
    
    console.log(`Minimal Reviews URL: ${config.minimalReviewsUrl}`);
    console.log(`RWS URL: ${config.rwsUrl}`);
    console.log(`Test Shop: ${config.testShop}`);
    console.log(`Test Product ID: ${config.testProductId}`);
    
    // 5. Sugestões de correção
    console.log('\n5️⃣ SUGESTÕES DE CORREÇÃO');
    console.log('==========================');
    
    console.log('�� Se Minimal Reviews não responde:');
    console.log('   - Verifique se o deploy foi feito corretamente');
    console.log('   - Verifique as variáveis de ambiente na Vercel');
    console.log('   - Verifique os logs de build na Vercel');
    
    console.log('\n🔧 Se RWS não responde:');
    console.log('   - Verifique se o deploy foi feito corretamente');
    console.log('   - Verifique as variáveis de ambiente na Vercel');
    console.log('   - Verifique os logs de build na Vercel');
    
    console.log('\n🔧 Se a integração falha:');
    console.log('   - Verifique se as URLs estão corretas');
    console.log('   - Verifique se os CORS estão configurados');
    console.log('   - Verifique se os formatos de dados são compatíveis');
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

debugProduction(); 