#!/bin/bash

# Exibir versões das ferramentas
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Instalar dependências (caso ainda não estejam instaladas)
echo "Instalando dependências..."
npm install

# Gerar cliente Prisma e aplicar migrações
echo "Configurando banco de dados..."
npx prisma generate
npx prisma migrate deploy

# Construir o aplicativo Remix
echo "Construindo aplicativo Remix..."
npx remix vite:build

echo "Build concluído com sucesso!" 