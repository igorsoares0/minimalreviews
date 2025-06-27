import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  List,
  Banner,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export default function Help() {
  return (
    <Page>
      <TitleBar title="Ajuda e Tutorial" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Bem-vindo ao Minimal Reviews
                </Text>
                <Text as="p" variant="bodyMd">
                  O Minimal Reviews é um app simples e eficiente para coletar e exibir avaliações dos seus produtos. 
                  Este tutorial irá te guiar através de todas as funcionalidades.
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  1. Configuração Inicial
                </Text>
                <List type="number">
                  <List.Item>
                    Acesse a página <strong>Configurações</strong> no menu lateral
                  </List.Item>
                  <List.Item>
                    Configure as preferências do app:
                    <List type="bullet">
                      <List.Item>Auto-publicar reviews (recomendado para começar)</List.Item>
                      <List.Item>Permitir reviews anônimos</List.Item>
                      <List.Item>Cor das estrelas</List.Item>
                      <List.Item>Tamanho máximo dos comentários</List.Item>
                    </List>
                  </List.Item>
                  <List.Item>
                    Clique em <strong>Salvar Configurações</strong>
                  </List.Item>
                </List>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  2. Instalação na Loja
                </Text>
                <Banner tone="info">
                  <p>Esta é a parte mais importante! Sem isso, os reviews não aparecerão na sua loja.</p>
                </Banner>
                <List type="number">
                  <List.Item>
                    No admin da Shopify, vá para <strong>Online Store → Themes</strong>
                  </List.Item>
                  <List.Item>
                    Clique em <strong>Customize</strong> no seu tema ativo
                  </List.Item>
                  <List.Item>
                    Navegue até uma página de produto qualquer
                  </List.Item>
                  <List.Item>
                    Procure por uma seção onde você quer adicionar os reviews (geralmente após a descrição do produto)
                  </List.Item>
                  <List.Item>
                    Clique em <strong>Add section</strong> ou <strong>Add block</strong>
                  </List.Item>
                  <List.Item>
                    Procure por <strong>"Minimal Reviews"</strong> na lista de apps
                  </List.Item>
                  <List.Item>
                    Configure as opções:
                    <List type="bullet">
                      <List.Item>Produto (já vem preenchido automaticamente)</List.Item>
                      <List.Item>Cor das estrelas</List.Item>
                      <List.Item>Mostrar lista de reviews</List.Item>
                    </List>
                  </List.Item>
                  <List.Item>
                    Clique em <strong>Save</strong>
                  </List.Item>
                </List>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  3. Gerenciando Reviews
                </Text>
                <List type="bullet">
                  <List.Item>
                    <strong>Dashboard:</strong> Veja estatísticas gerais e reviews recentes
                  </List.Item>
                  <List.Item>
                    <strong>Página Reviews:</strong> Gerencie todos os reviews com filtros avançados
                  </List.Item>
                  <List.Item>
                    <strong>Ações disponíveis:</strong>
                    <List type="bullet">
                      <List.Item>Publicar/Ocultar reviews</List.Item>
                      <List.Item>Ver detalhes completos</List.Item>
                      <List.Item>Excluir reviews inadequados</List.Item>
                    </List>
                  </List.Item>
                </List>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  4. Como os Clientes Deixam Reviews
                </Text>
                <List type="number">
                  <List.Item>
                    O cliente visita uma página de produto
                  </List.Item>
                  <List.Item>
                    Vê a seção de reviews (se já houver reviews, vê a média)
                  </List.Item>
                  <List.Item>
                    Clica no botão <strong>"Escrever Review"</strong>
                  </List.Item>
                  <List.Item>
                    Preenche o formulário:
                    <List type="bullet">
                      <List.Item>Avaliação em estrelas (obrigatório)</List.Item>
                      <List.Item>Nome (opcional)</List.Item>
                      <List.Item>Email (opcional)</List.Item>
                      <List.Item>Título (opcional)</List.Item>
                      <List.Item>Comentário (opcional)</List.Item>
                    </List>
                  </List.Item>
                  <List.Item>
                    Envia o review
                  </List.Item>
                  <List.Item>
                    Review aparece na loja (se auto-publicação estiver ativa) ou aguarda aprovação
                  </List.Item>
                </List>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  5. Dicas e Boas Práticas
                </Text>
                <List type="bullet">
                  <List.Item>
                    <strong>Auto-publicação:</strong> Mantenha ativa inicialmente para facilitar o crescimento
                  </List.Item>
                  <List.Item>
                    <strong>Reviews anônimos:</strong> Permita para aumentar o número de avaliações
                  </List.Item>
                  <List.Item>
                    <strong>Moderação:</strong> Verifique regularmente a página de Reviews para moderar conteúdo
                  </List.Item>
                  <List.Item>
                    <strong>Incentivo:</strong> Peça para clientes satisfeitos deixarem reviews
                  </List.Item>
                  <List.Item>
                    <strong>Resposta:</strong> Considere responder a reviews negativos de forma construtiva
                  </List.Item>
                </List>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  6. Solução de Problemas
                </Text>
                <BlockStack gap="300">
                  <div>
                    <Text as="h3" variant="headingSm">
                      Os reviews não aparecem na loja
                    </Text>
                    <List type="bullet">
                      <List.Item>Verifique se a extensão foi instalada corretamente no tema</List.Item>
                      <List.Item>Confirme se o produto está selecionado nas configurações da seção</List.Item>
                      <List.Item>Verifique se há reviews publicados para o produto</List.Item>
                    </List>
                  </div>
                  
                  <Divider />
                  
                  <div>
                    <Text as="h3" variant="headingSm">
                      Clientes não conseguem enviar reviews
                    </Text>
                    <List type="bullet">
                      <List.Item>Verifique se reviews anônimos estão permitidos (se aplicável)</List.Item>
                      <List.Item>Confirme se o botão "Escrever Review" está visível</List.Item>
                      <List.Item>Teste o formulário você mesmo</List.Item>
                    </List>
                  </div>
                  
                  <Divider />
                  
                  <div>
                    <Text as="h3" variant="headingSm">
                      Reviews não são aprovados automaticamente
                    </Text>
                    <List type="bullet">
                      <List.Item>Verifique se "Auto-publicar reviews" está ativo nas configurações</List.Item>
                      <List.Item>Confirme se "Exigir aprovação manual" está desativado</List.Item>
                      <List.Item>Aprove manualmente na página Reviews se necessário</List.Item>
                    </List>
                  </div>
                </BlockStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  7. Testando o Sistema de Email
                </Text>
                <Banner tone="info">
                  <p>Use o Mailtrap para testar emails com segurança, sem enviar para clientes reais.</p>
                </Banner>
                <List type="number">
                  <List.Item>
                    <strong>Criar conta no Mailtrap:</strong>
                    <List type="bullet">
                      <List.Item>Acesse <strong>mailtrap.io</strong> e crie uma conta gratuita</List.Item>
                      <List.Item>Vá para <strong>Email Testing → Inboxes</strong></List.Item>
                      <List.Item>Copie o <strong>Inbox ID</strong> (número da inbox)</List.Item>
                      <List.Item>Vá para <strong>API Tokens</strong> e copie seu token</List.Item>
                    </List>
                  </List.Item>
                  <List.Item>
                    Configure o Mailtrap nas <strong>Configurações</strong>:
                    <List type="bullet">
                      <List.Item><strong>Provedor:</strong> Mailtrap (Teste)</List.Item>
                      <List.Item><strong>API Token:</strong> Cole seu token do Mailtrap</List.Item>
                      <List.Item><strong>Inbox ID:</strong> Cole o ID da sua inbox</List.Item>
                      <List.Item><strong>Email do Remetente:</strong> Qualquer email válido (ex: teste@exemplo.com)</List.Item>
                    </List>
                  </List.Item>
                  <List.Item>
                    Vá para a página <strong>Reviews</strong>
                  </List.Item>
                  <List.Item>
                    Clique no botão <strong>"Enviar Convite Manual"</strong>
                  </List.Item>
                  <List.Item>
                    Preencha os dados:
                    <List type="bullet">
                      <List.Item><strong>ID do Produto:</strong> Copie de qualquer produto (ex: gid://shopify/Product/123456789)</List.Item>
                      <List.Item><strong>Nome do Cliente:</strong> Seu nome ou nome de teste</List.Item>
                      <List.Item><strong>Email:</strong> Seu email ou email de teste</List.Item>
                    </List>
                  </List.Item>
                  <List.Item>
                    Clique em <strong>"Enviar Email"</strong>
                  </List.Item>
                  <List.Item>
                    Vá para sua inbox no Mailtrap.io e visualize o email
                  </List.Item>
                  <List.Item>
                    Clique no link do email para testar a página de review
                  </List.Item>
                </List>
                
                <div>
                  <Text as="h3" variant="headingSm">
                    Vantagens do Mailtrap para Testes
                  </Text>
                  <List type="bullet">
                    <List.Item><strong>Seguro:</strong> Emails não são enviados para clientes reais</List.Item>
                    <List.Item><strong>Gratuito:</strong> Até 100 emails/mês</List.Item>
                    <List.Item><strong>Visual:</strong> Veja como o email aparece em diferentes clientes</List.Item>
                    <List.Item><strong>Debug:</strong> Analise cabeçalhos, HTML e possíveis problemas</List.Item>
                  </List>
                </div>
                
                <div>
                  <Text as="h3" variant="headingSm">
                    Como encontrar o ID do Produto
                  </Text>
                  <List type="bullet">
                    <List.Item>No admin da Shopify, vá para <strong>Products</strong></List.Item>
                    <List.Item>Clique em qualquer produto</List.Item>
                    <List.Item>Na URL, você verá algo como: <code>/admin/products/123456789</code></List.Item>
                    <List.Item>O ID completo será: <code>gid://shopify/Product/123456789</code></List.Item>
                  </List>
                </div>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Precisa de Ajuda?
                </Text>
                <Text as="p" variant="bodyMd">
                  Se você ainda tem dúvidas ou encontrou algum problema, entre em contato conosco:
                </Text>
                <List type="bullet">
                  <List.Item>Email: suporte@minimalreviews.com</List.Item>
                  <List.Item>Documentação: docs.minimalreviews.com</List.Item>
                </List>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 