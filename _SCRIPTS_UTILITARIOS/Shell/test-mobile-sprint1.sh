#!/bin/bash
# 🚀 SCRIPT DE TESTES - MOBILE SPRINT 1
# Uso: bash test-mobile-sprint1.sh

echo "=========================================="
echo "📱 TESTE MOBILE - SPRINT 1"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar Node.js
echo "${BLUE}[1/5] Verificando Node.js...${NC}"
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓ Node.js $(node -v)${NC}"
else
    echo -e "${RED}✗ Node.js não encontrado${NC}"
    exit 1
fi

# Ir para diretório correto
echo ""
echo "${BLUE}[2/5] Entrando em frontend...${NC}"
cd sistema/wgeasy/frontend || { echo -e "${RED}✗ Diretório não encontrado${NC}"; exit 1; }
echo -e "${GREEN}✓ Em $(pwd)${NC}"

# Verificar dependências
echo ""
echo "${BLUE}[3/5] Verificando dependências...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ node_modules encontrado${NC}"
else
    echo -e "${YELLOW}⚠ Instalando dependências...${NC}"
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ npm install completado${NC}"
    else
        echo -e "${RED}✗ npm install falhou${NC}"
        exit 1
    fi
fi

# Type check
echo ""
echo "${BLUE}[4/5] TypeScript check...${NC}"
if npm run type-check &> /dev/null; then
    echo -e "${GREEN}✓ Sem erros TypeScript${NC}"
else
    echo -e "${YELLOW}⚠ Verificando erros:${NC}"
    npm run type-check
fi

# Build check
echo ""
echo "${BLUE}[5/5] Build check...${NC}"
if npm run build &> /dev/null; then
    echo -e "${GREEN}✓ Build bem-sucedido${NC}"
else
    echo -e "${YELLOW}⚠ Verificando build:${NC}"
    npm run build
fi

echo ""
echo "=========================================="
echo "${GREEN}✓ PRONTO PARA TESTES!${NC}"
echo "=========================================="
echo ""
echo "Próximo: npm run dev"
echo "Acesso: http://localhost:5173"
echo "Mobile: Ctrl+Shift+M (no DevTools)"
echo ""
echo "Viewports para testar:"
echo "  - 375px (iPhone SE)"
echo "  - 390px (iPhone 12)"
echo "  - 768px (iPad)"
echo "  - 1920px (Desktop)"
echo ""
echo "Checklist: Veja TESTE_MOBILE_CHECKLIST.md"
echo ""
