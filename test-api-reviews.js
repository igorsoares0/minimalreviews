import fetch from 'node-fetch';

async function testApiReviews() {
  console.log('🧪 Testando API de reviews...\n');
  
  const testUrl = 'http://localhost:3000/api/reviews';
  const params = new URLSearchParams({
    shop: 'lojatesteigor.myshopify.com',
    productId: 'gid://shopify/Product/123456789'
  });
  
  const fullUrl = `${testUrl}?${params}`;
  console.log(`📡 Testando URL: ${fullUrl}\n`);
  
  try {
    const response = await fetch(fullUrl);
    
    console.log(`�� Status: ${response.status}`);
    console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));
    
    const contentType = response.headers.get('content-type');
    console.log(`📄 Content-Type: ${contentType}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Resposta JSON:', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('❌ Resposta de erro:', text.substring(0, 500));
    }
    
  } catch (error) {
    console.error('�� Erro na requisição:', error.message);
  }
}

testApiReviews();