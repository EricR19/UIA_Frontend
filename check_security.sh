#!/bin/bash

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Verificando seguridad del frontend..."

ERRORS=0
WARNINGS=0

# 1. Verificar que .env no esté en Git
echo ""
echo "1️⃣  Verificando archivo .env..."
if git ls-files --error-unmatch .env 2>/dev/null; then
    echo -e "${RED}❌ CRÍTICO: .env está en Git!${NC}"
    echo "   Ejecutar: git rm --cached .env"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ .env no está en Git${NC}"
fi

# 2. Verificar .gitignore
echo ""
echo "2️⃣  Verificando .gitignore..."
if grep -q "^\.env$" .gitignore; then
    echo -e "${GREEN}✅ .env está en .gitignore${NC}"
else
    echo -e "${RED}❌ CRÍTICO: .env NO está en .gitignore${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 3. Verificar .env.example
echo ""
echo "3️⃣  Verificando .env.example..."
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✅ .env.example existe${NC}"
else
    echo -e "${YELLOW}⚠️  .env.example no existe${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 4. Verificar URLs hardcodeadas
echo ""
echo "4️⃣  Verificando URLs hardcodeadas en código..."
if grep -r "http://localhost:8000" --include="*.jsx" --include="*.js" src/ 2>/dev/null | grep -v "import.meta.env" | grep -v "//"; then
    echo -e "${YELLOW}⚠️  URLs hardcodeadas encontradas${NC}"
    echo "   Usar import.meta.env.VITE_API_URL"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ No se encontraron URLs hardcodeadas${NC}"
fi

# 5. Verificar API keys expuestas
echo ""
echo "5️⃣  Verificando API keys en código..."
if grep -rE "(api[_-]?key|token)\s*[:=]\s*['\"][a-zA-Z0-9]{20,}['\"]" --include="*.jsx" --include="*.js" src/ 2>/dev/null; then
    echo -e "${RED}❌ CRÍTICO: Posibles API keys encontradas!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No se encontraron API keys expuestas${NC}"
fi

# 6. Verificar contraseñas hardcodeadas
echo ""
echo "6️⃣  Verificando contraseñas en código..."
if grep -rE "password\s*[:=]\s*['\"][^'\"]+['\"]" --include="*.jsx" --include="*.js" src/ 2>/dev/null | grep -v "formData" | grep -v "useState" | grep -v "newPassword" | grep -v "Password"; then
    echo -e "${YELLOW}⚠️  Posibles contraseñas encontradas${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ No se encontraron contraseñas hardcodeadas${NC}"
fi

# 7. Verificar archivos de test
echo ""
echo "7️⃣  Verificando archivos de test..."
TEST_FILES=$(find . -type f \( -name "test_*.js*" -o -name "*_test.js*" -o -name "*.test.js*" \) ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null)
if [ -n "$TEST_FILES" ]; then
    echo -e "${YELLOW}⚠️  Archivos de test encontrados:${NC}"
    echo "$TEST_FILES"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ No se encontraron archivos de test${NC}"
fi

# 8. Verificar node_modules
echo ""
echo "8️⃣  Verificando que node_modules no esté en Git..."
if git ls-files --error-unmatch node_modules/ 2>/dev/null; then
    echo -e "${RED}❌ CRÍTICO: node_modules está en Git!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ node_modules no está en Git${NC}"
fi

# 9. Verificar dist
echo ""
echo "9️⃣  Verificando que dist no esté en Git..."
if git ls-files --error-unmatch dist/ 2>/dev/null; then
    echo -e "${YELLOW}⚠️  dist está en Git${NC}"
    echo "   Considerar: git rm -r --cached dist/"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ dist no está en Git${NC}"
fi

# Resumen
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMEN DE SEGURIDAD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ ERRORES CRÍTICOS: $ERRORS${NC}"
    echo -e "${RED}   ⛔ NO subir a GitHub hasta resolver${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  ADVERTENCIAS: $WARNINGS${NC}"
    echo -e "${YELLOW}   ⚡ Revisar antes de desplegar en producción${NC}"
    exit 0
else
    echo -e "${GREEN}✅ TODO PERFECTO - LISTO PARA GITHUB${NC}"
    echo ""
    echo "Comandos para subir:"
    echo "  git add ."
    echo "  git commit -m 'Initial commit - Frontend UIA'"
    echo "  git push -u origin main"
    exit 0
fi
