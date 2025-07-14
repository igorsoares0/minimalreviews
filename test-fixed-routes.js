import fetch from 'node-fetch';

async function testFixedRoutes() {
  console.log('�� TESTANDO ROTAS CORRIGIDAS\n');
  
  const baseUrl = 'https://minimalreviews.vercel.app';
  const testShop = 'lojatesteigor.myshopify.com';
  const testProductId = 'gid://shopify/Product/123456789';
  
  const testUrls = [
    // URLs que devem funcionar após a correção
    `${baseUrl}/api/reviews?shop=${testShop}&productId=${testProductId}`,
    `${baseUrl}/api/config?shop=${testShop}`,
    `${baseUrl}/api/test-rws`,
    
    // URLs antigas (que não devem funcionar)
    `${baseUrl}/app/api/reviews?shop=${testShop}&productId=${testProductId}`,
  ];
  
  for (const url of testUrls) {
    console.log(`\n📡 Testando: ${url}`);
    console.log('='.repeat(80));
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000
      });
      
      console.log(`Status: ${response.status}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Resposta OK');
        if (data.reviews) {
          console.log(`Reviews: ${data.reviews.length}`);
        }
        if (data.stats) {
          console.log(`Stats: ${JSON.stringify(data.stats)}`);
        }
      } else {
        const text = await response.text();
        console.log(`❌ Erro: ${text.substring(0, 200)}`);
      }
    } catch (error) {
      console.log(`❌ Erro de conexão: ${error.message}`);
    }
  }
  
  console.log('\n�� RESULTADO ESPERADO:');
  console.log('✅ /api/reviews deve retornar 200');
  console.log('✅ /api/config deve retornar 200');
  console.log('✅ /api/test-rws deve retornar 200');
  console.log('❌ /app/api/reviews deve retornar 404 (antiga rota)');
}

testFixedRoutes(); 