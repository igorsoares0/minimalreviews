import fetch from 'node-fetch';

async function testProductionApi() {
  console.log('🧪 TESTANDO API DE PRODUÇÃO - ERRO JSON.PARSE\n');
  
  const testUrls = [
    'https://minimalreviews.vercel.app/api/reviews?shop=lojatesteigor.myshopify.com&productId=gid://shopify/Product/123456789',
    'https://minimalreviews.vercel.app/api/reviews?shop=lojatesteigor.myshopify.com&productId=123456789',
    'https://minimalreviews.vercel.app/api/config?shop=lojatesteigor.myshopify.com'
  ];
  
  for (const url of testUrls) {
    console.log(`\n📡 Testando: ${url}`);
    console.log('='.repeat(80));
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });
      
      console.log(`Status: ${response.status}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      console.log(`Content-Length: ${response.headers.get('content-length')}`);
      
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      if (response.ok) {
        if (isJson) {
          try {
            const data = await response.json();
            console.log('✅ Resposta JSON válida:');
            console.log(JSON.stringify(data, null, 2));
          } catch (parseError) {
            console.log('❌ Erro ao fazer parse do JSON:', parseError.message);
            const text = await response.text();
            console.log('Resposta bruta:', text.substring(0, 500));
          }
        } else {
          const text = await response.text();
          console.log('⚠️ Resposta não é JSON:');
          console.log(text.substring(0, 500));
        }
      } else {
        const text = await response.text();
        console.log('❌ Erro HTTP:');
        console.log(text.substring(0, 500));
        
        // Verificar se é uma página de erro HTML
        if (text.includes('<html') || text.includes('<!DOCTYPE')) {
          console.log('🔍 Detectado: Resposta HTML (página de erro)');
        }
      }
      
    } catch (error) {
      console.log('❌ Erro de conexão:', error.message);
    }
  }
  
  // Testar RWS também
  console.log('\n\n🌐 TESTANDO RWS');
  console.log('='.repeat(80));
  
  const rwsUrls = [
    'https://rws-three.vercel.app/api/reviews',
    'https://rws-three.vercel.app/api/reviews?shopifyShop=lojatesteigor.myshopify.com'
  ];
  
  for (const url of rwsUrls) {
    console.log(`\n📡 Testando RWS: ${url}`);
    
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
        console.log('✅ RWS respondeu corretamente');
        console.log(`Reviews encontradas: ${Array.isArray(data) ? data.length : 'N/A'}`);
      } else {
        const text = await response.text();
        console.log('❌ RWS com erro:', text.substring(0, 200));
      }
    } catch (error) {
      console.log('❌ Erro de conexão com RWS:', error.message);
    }
  }
}

testProductionApi();