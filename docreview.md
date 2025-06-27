# 📋 API de Reviews - Documentação Completa

Sistema completo de coleta e gerenciamento de avaliações para ecommerce com suporte a upload de mídia.

## 🔗 Base URL
```
http://localhost:3000/api
```

---

## 📊 Endpoints de Reviews

### 1. **Listar Reviews**
```http
GET /api/reviews
```

**Parâmetros de Query:**
- `productId` (string, opcional) - ID do produto para filtrar reviews
- `limit` (number, opcional) - Limite de resultados

**Exemplo de Requisição:**
```bash
curl "http://localhost:3000/api/reviews?productId=cmc4exidp0005d5hg43yz99yh&limit=10"
```

**Resposta de Sucesso (200):**
```json
[
  {
    "id": "cmc4exiej000kd5hgabcd1234",
    "rating": 5,
    "comment": "Produto excelente! Superou minhas expectativas.",
    "productId": "cmc4exidp0005d5hg43yz99yh",
    "userId": "cmc4exid70000d5hg7evlvggc",
    "customerName": null,
    "customerEmail": null,
    "verified": true,
    "helpful": 3,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "user": {
      "id": "cmc4exid70000d5hg7evlvggc",
      "name": "João Silva",
      "email": "joao@example.com"
    },
    "media": [
      {
        "id": "media123",
        "type": "IMAGE",
        "url": "/uploads/reviews/abc123.jpg",
        "filename": "produto-foto.jpg"
      }
    ]
  }
]
```

---

### 2. **Criar Nova Review**
```http
POST /api/reviews
```

**Headers:**
```
Content-Type: application/json
```

**Body Parameters:**
- `rating` (number, obrigatório) - Avaliação de 1 a 5 estrelas
- `comment` (string, opcional) - Comentário da avaliação
- `productId` (string, obrigatório) - ID do produto sendo avaliado
- `userId` (string, opcional) - ID do usuário logado
- `customerName` (string, opcional) - Nome do cliente (se não logado)
- `customerEmail` (string, opcional) - Email do cliente (se não logado)
- `media` (array, opcional) - Array de mídias anexadas

**Exemplo de Requisição:**
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Produto incrível! A qualidade é excelente e chegou rapidamente.",
    "productId": "cmc4exidp0005d5hg43yz99yh",
    "customerName": "Maria Santos",
    "customerEmail": "maria@email.com",
    "media": [
      {
        "type": "IMAGE",
        "url": "/uploads/reviews/photo123.jpg",
        "filename": "produto-foto.jpg",
        "size": 1024000
      }
    ]
  }'
```

**Resposta de Sucesso (201):**
```json
{
  "id": "cmc4exiej000kd5hgabcd1234",
  "rating": 5,
  "comment": "Produto incrível! A qualidade é excelente e chegou rapidamente.",
  "productId": "cmc4exidp0005d5hg43yz99yh",
  "userId": null,
  "customerName": "Maria Santos",
  "customerEmail": "maria@email.com",
  "verified": false,
  "helpful": 0,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "user": null,
  "product": {
    "id": "cmc4exidp0005d5hg43yz99yh",
    "name": "Smartphone XYZ Pro",
    "description": "Smartphone premium..."
  },
  "media": [
    {
      "id": "media123",
      "type": "IMAGE",
      "url": "/uploads/reviews/photo123.jpg",
      "filename": "produto-foto.jpg",
      "size": 1024000,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Erros Possíveis:**
```json
// 400 - Dados inválidos
{
  "error": "Rating and productId are required"
}

// 400 - Rating fora do intervalo
{
  "error": "Rating must be between 1 and 5"
}

// 400 - Falta informação do cliente
{
  "error": "Customer name or email is required for guest reviews"
}
```

---

### 3. **Marcar Review como Útil**
```http
POST /api/reviews/{reviewId}/helpful
```

**Parâmetros de URL:**
- `reviewId` (string, obrigatório) - ID da review

**Exemplo de Requisição:**
```bash
curl -X POST http://localhost:3000/api/reviews/cmc4exiej000kd5hgabcd1234/helpful
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Review marked as helpful",
  "helpful": 4
}
```

**Erros Possíveis:**
```json
// 404 - Review não encontrada
{
  "error": "Review not found"
}
```

---

## 📁 Upload de Mídia

### **Upload de Arquivos**
```http
POST /api/upload
```

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `files` (File[], obrigatório) - Arquivos para upload

**Tipos de Arquivo Aceitos:**
- **Imagens:** JPEG, JPG, PNG, WEBP, GIF
- **Vídeos:** MP4, WEBM, MOV, AVI
- **Tamanho Máximo:** 10MB por arquivo

**Exemplo de Requisição:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "files=@produto-foto1.jpg" \
  -F "files=@produto-video.mp4"
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Files uploaded successfully",
  "files": [
    {
      "filename": "abc123-def456.jpg",
      "originalName": "produto-foto1.jpg",
      "url": "/uploads/reviews/abc123-def456.jpg",
      "type": "IMAGE",
      "size": 1024000,
      "mimeType": "image/jpeg"
    },
    {
      "filename": "xyz789-uvw012.mp4",
      "originalName": "produto-video.mp4",
      "url": "/uploads/reviews/xyz789-uvw012.mp4",
      "type": "VIDEO",
      "size": 5120000,
      "mimeType": "video/mp4"
    }
  ]
}
```

---

## 🏗️ Estrutura de Dados

### **Review Object**
```typescript
interface Review {
  id: string                    // ID único da review
  rating: number               // Avaliação de 1-5 estrelas
  comment?: string             // Comentário opcional
  productId: string            // ID do produto
  userId?: string              // ID do usuário (se logado)
  customerName?: string        // Nome do cliente (se guest)
  customerEmail?: string       // Email do cliente (se guest)
  verified: boolean            // Se a compra foi verificada
  helpful: number              // Quantas pessoas acharam útil
  createdAt: string            // Data de criação (ISO)
  updatedAt: string            // Data de atualização (ISO)
  user?: User                  // Dados do usuário (se aplicável)
  product?: Product            // Dados do produto
  media: ReviewMedia[]         // Mídias anexadas
}
```

### **ReviewMedia Object**
```typescript
interface ReviewMedia {
  id: string                   // ID único da mídia
  reviewId: string             // ID da review
  type: 'IMAGE' | 'VIDEO'      // Tipo de mídia
  url: string                  // URL do arquivo
  filename?: string            // Nome original do arquivo
  size?: number                // Tamanho em bytes
  createdAt: string            // Data de upload (ISO)
}
```

---

## 🔧 Exemplos de Integração

### **JavaScript/Fetch**
```javascript
// Criar uma review
const createReview = async (reviewData) => {
  const response = await fetch('/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reviewData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create review');
  }
  
  return await response.json();
};

// Listar reviews de um produto
const getProductReviews = async (productId) => {
  const response = await fetch(`/api/reviews?productId=${productId}`);
  return await response.json();
};
```

### **React Hook**
```javascript
import { useState, useEffect } from 'react';

const useReviews = (productId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?productId=${productId}`);
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  return { reviews, loading };
};
```

### **Python/Requests**
```python
import requests

# Criar uma review
def create_review(review_data):
    response = requests.post(
        'http://localhost:3000/api/reviews',
        json=review_data
    )
    return response.json()

# Listar reviews
def get_reviews(product_id=None):
    params = {'productId': product_id} if product_id else {}
    response = requests.get(
        'http://localhost:3000/api/reviews',
        params=params
    )
    return response.json()
```

---

## 🚀 Casos de Uso

### **1. Sistema de Avaliação Simples**
```javascript
// Enviar avaliação básica
const review = await createReview({
  rating: 5,
  comment: "Produto excelente!",
  productId: "product123",
  customerName: "João Silva",
  customerEmail: "joao@email.com"
});
```

### **2. Avaliação com Mídia**
```javascript
// 1. Upload das imagens
const formData = new FormData();
formData.append('files', imageFile);
const uploadResponse = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
const { files } = await uploadResponse.json();

// 2. Criar review com mídia
const review = await createReview({
  rating: 4,
  comment: "Boa qualidade, conforme as fotos.",
  productId: "product123",
  customerName: "Maria Santos",
  media: files
});
```

### **3. Widget de Reviews**
```javascript
// Componente para exibir reviews
const ReviewsWidget = ({ productId }) => {
  const { reviews, loading } = useReviews(productId);
  
  if (loading) return <div>Carregando...</div>;
  
  return (
    <div>
      {reviews.map(review => (
        <div key={review.id}>
          <div>⭐ {review.rating}/5</div>
          <p>{review.comment}</p>
          <small>por {review.user?.name || review.customerName}</small>
        </div>
      ))}
    </div>
  );
};
```

---

## ⚙️ Configuração

### **Variáveis de Ambiente**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
```

### **Inicialização**
```bash
# Instalar dependências
npm install

# Configurar banco de dados
npx prisma db push
npx prisma db seed

# Iniciar servidor
npm run dev
```

---

## 🔒 Segurança

- ✅ **Validação de entrada** em todos os endpoints
- ✅ **Sanitização de dados** antes de salvar no banco
- ✅ **Validação de tipos de arquivo** no upload
- ✅ **Limite de tamanho** para uploads (10MB)
- ✅ **Tratamento de erros** estruturado
- ✅ **Prevenção de SQL Injection** via Prisma ORM

---

## 📈 Performance

- ✅ **Paginação** via parâmetro `limit`
- ✅ **Filtros eficientes** por produto
- ✅ **Índices de banco** otimizados
- ✅ **Upload otimizado** com validação prévia
- ✅ **Queries relacionais** otimizadas

---

*Documentação atualizada em: junho 2025*
