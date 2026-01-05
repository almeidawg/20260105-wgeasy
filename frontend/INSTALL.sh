#!/bin/bash

# Script de instalação e configuração do Módulo Pessoas - WGEASY
# Execute com: bash INSTALL.sh

echo "=================================================="
echo "🚀 INSTALAÇÃO MÓDULO PESSOAS - WGEASY"
echo "=================================================="
echo ""

# Verifica se está na pasta correta
if [ ! -f "package.json" ]; then
  echo "❌ Erro: Execute este script na pasta 'frontend'"
  exit 1
fi

echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
  echo "❌ Erro ao instalar dependências"
  exit 1
fi

echo "✅ Dependências instaladas com sucesso!"
echo ""

# Verifica se .env existe
if [ ! -f ".env" ]; then
  echo "⚠️  Arquivo .env não encontrado"
  echo "📝 Criando .env a partir de .env.example..."

  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✅ Arquivo .env criado!"
    echo ""
    echo "⚠️  IMPORTANTE: Configure suas credenciais Supabase no arquivo .env"
    echo "   VITE_SUPABASE_URL=https://seu-projeto.supabase.co"
    echo "   VITE_SUPABASE_ANON_KEY=sua-chave-anon-key"
    echo ""
  else
    echo "❌ Arquivo .env.example não encontrado"
    exit 1
  fi
else
  echo "✅ Arquivo .env já existe"
  echo ""
fi

echo "=================================================="
echo "✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
echo "=================================================="
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Configure o arquivo .env com suas credenciais Supabase"
echo "2. Execute o SQL no Supabase (veja MODULO_PESSOAS.md)"
echo "3. Execute: npm run dev"
echo "4. Acesse: http://localhost:5173"
echo ""
echo "📖 Documentação completa: MODULO_PESSOAS.md"
echo ""
