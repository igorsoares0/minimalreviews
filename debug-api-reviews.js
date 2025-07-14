import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function debugApiReviews() {
  try {
    console.log('🔍 Diagnosticando problema da API de reviews...\n');
    
    // 1. Testar conexão com banco
    console.log('1. Testando conexão com banco de dados...');
    try {
      await db.$connect();
      console.log('✅ Conexão com banco OK');
    } catch (error) {
      console.error('❌ Erro de conexão:', error.message);
      return;
    }
    
    // 2. Verificar se as tabelas existem
    console.log('\n2. Verificando tabelas...');
    try {
      const sessionCount = await db.session.count();
      console.log(`✅ Tabela Session: ${sessionCount} registros`);
      
      const reviewCount = await db.review.count();
      console.log(`✅ Tabela Review: ${reviewCount} registros`);
      
      const settingsCount = await db.reviewSettings.count();
      console.log(`✅ Tabela ReviewSettings: ${settingsCount} registros`);
    } catch (error) {
      console.error('❌ Erro ao verificar tabelas:', error.message);
      console.log('💡 Execute: npx prisma migrate deploy');
      return;
    }
    
    // 3. Verificar configurações da loja
    console.log('\n3. Verificando configurações...');
    const settings = await db.reviewSettings.findFirst();
    
    if (!settings) {
      console.log('⚠️  Nenhuma configuração encontrada');
      console.log('💡 Acesse o admin do app para configurar');
    } else {
      console.log(`✅ Configurações encontradas para: ${settings.shop}`);
      console.log(`   - Template: ${settings.reviewTemplate}`);
      console.log(`   - Auto publish: ${settings.autoPublish}`);
      console.log(`   - Allow anonymous: ${settings.allowAnonymous}`);
    }
    
    // 4. Testar query de reviews
    console.log('\n4. Testando query de reviews...');
    try {
      const testShop = settings?.shop || 'lojatesteigor.myshopify.com';
      const testProductId = 'gid://shopify/Product/123456789';
      
      const reviews = await db.review.findMany({
        where: {
          shop: testShop,
          productId: { in: [testProductId, '123456789', 'gid://shopify/Product/123456789'] },
          published: true,
        },
        take: 5,
      });
      
      console.log(`✅ Query OK - ${reviews.length} reviews encontradas`);
    } catch (error) {
      console.error('❌ Erro na query:', error.message);
    }
    
    // 5. Verificar variáveis de ambiente
    console.log('\n5. Verificando variáveis de ambiente...');
    const requiredEnvVars = ['DATABASE_URL', 'SHOPIFY_API_KEY', 'SHOPIFY_API_SECRET'];
    
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar}: configurada`);
      } else {
        console.log(`❌ ${envVar}: não configurada`);
      }
    }
    
    // 6. Sugestões de correção
    console.log('\n6. Sugestões de correção:');
    console.log('   a) Verifique se o app está rodando: npm run dev');
    console.log('   b) Verifique se o banco está acessível');
    console.log('   c) Execute migrações: npx prisma migrate deploy');
    console.log('   d) Verifique logs do servidor para erros específicos');
    console.log('   e) Teste a API diretamente: curl "http://localhost:3000/api/reviews?shop=lojatesteigor.myshopify.com&productId=123"');
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  } finally {
    await db.$disconnect();
  }
}

debugApiReviews(); 