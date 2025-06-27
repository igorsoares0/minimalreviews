#!/bin/bash

# Exibir versões das ferramentas
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Instalar dependências (caso ainda não estejam instaladas)
echo "Instalando dependências..."
npm install

# Usar o script de configuração em vez do Prisma CLI
echo "Configurando ambiente..."
node vercel-setup.js

# Construir o aplicativo Remix
echo "Construindo aplicativo Remix..."
npx remix vite:build

echo "Build concluído com sucesso!" 