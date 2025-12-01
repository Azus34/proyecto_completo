#!/bin/bash
# ==========================================
# Blue-Green Deployment Switch Script
# ==========================================
# Este script permite cambiar el tráfico entre
# los entornos BLUE y GREEN sin downtime
# ==========================================

CONFIG_FILE="./nginx/conf.d/default.conf"
CURRENT_ENV=""
NEW_ENV=""

# Colores para output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "=========================================="
echo "   🔄 Blue-Green Deployment Switch"
echo "=========================================="
echo ""

# Detectar entorno actual
if grep -q "server api-blue:3000;" "$CONFIG_FILE" | grep -v "#"; then
    if grep "upstream api_active" -A2 "$CONFIG_FILE" | grep -q "api-blue"; then
        CURRENT_ENV="BLUE"
        NEW_ENV="GREEN"
    else
        CURRENT_ENV="GREEN"
        NEW_ENV="BLUE"
    fi
fi

# Verificar estado actual
echo -e "📊 Estado actual:"
echo ""

# Health check de ambos entornos
echo -n "   🔵 BLUE:  "
BLUE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/blue-health 2>/dev/null)
if [ "$BLUE_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ No disponible${NC}"
fi

echo -n "   🟢 GREEN: "
GREEN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/green-health 2>/dev/null)
if [ "$GREEN_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Healthy${NC}"
else
    echo -e "${RED}✗ No disponible${NC}"
fi

echo ""
echo -n "   🎯 Activo: "
ACTIVE=$(curl -s http://localhost/health 2>/dev/null | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
if [ "$ACTIVE" == "BLUE" ]; then
    echo -e "${BLUE}BLUE${NC}"
elif [ "$ACTIVE" == "GREEN" ]; then
    echo -e "${GREEN}GREEN${NC}"
else
    echo -e "${YELLOW}Desconocido${NC}"
fi

echo ""
echo "=========================================="
echo ""

# Menú de opciones
echo "Seleccione una opción:"
echo ""
echo "  1) 🔵 Cambiar a BLUE"
echo "  2) 🟢 Cambiar a GREEN"
echo "  3) 📊 Solo verificar estado"
echo "  4) ❌ Salir"
echo ""
read -p "Opción: " option

case $option in
    1)
        echo ""
        echo -e "${BLUE}🔄 Cambiando tráfico a BLUE...${NC}"
        sed -i 's/server api-green:3000;  # <-- CAMBIAR/server api-blue:3000;  # <-- CAMBIAR/' "$CONFIG_FILE"
        docker exec nginx-proxy nginx -s reload
        echo -e "${GREEN}✓ Tráfico redirigido a BLUE${NC}"
        ;;
    2)
        echo ""
        echo -e "${GREEN}🔄 Cambiando tráfico a GREEN...${NC}"
        sed -i 's/server api-blue:3000;  # <-- CAMBIAR/server api-green:3000;  # <-- CAMBIAR/' "$CONFIG_FILE"
        docker exec nginx-proxy nginx -s reload
        echo -e "${GREEN}✓ Tráfico redirigido a GREEN${NC}"
        ;;
    3)
        echo ""
        echo "Estado verificado arriba."
        ;;
    4)
        echo ""
        echo "Saliendo..."
        exit 0
        ;;
    *)
        echo ""
        echo -e "${RED}Opción no válida${NC}"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo -n "🎯 Entorno activo ahora: "
sleep 1
NEW_ACTIVE=$(curl -s http://localhost/health 2>/dev/null | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
if [ "$NEW_ACTIVE" == "BLUE" ]; then
    echo -e "${BLUE}BLUE${NC}"
elif [ "$NEW_ACTIVE" == "GREEN" ]; then
    echo -e "${GREEN}GREEN${NC}"
fi
echo "=========================================="
echo ""
