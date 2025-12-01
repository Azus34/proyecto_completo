#  Proyecto de Arquitectura de Despliegue, Pruebas y Monitoreo



##  Requisitos Previos

- **Node.js** v18 o superior
- **Docker** y **Docker Compose**
- **npm** o **yarn**


##  Instalación y Ejecución

### Opción 1: Ejecución con Docker (Recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/Azus34/proyecto_completo.git
cd proyecto_completo

# 2. Construir y levantar los contenedores
docker-compose up --build

# 3. Verificar que los servicios están corriendo
docker-compose ps

# 4. Acceder a la API
# La API estará disponible en: http://localhost
```

### Opción 2: Ejecución Local (Desarrollo)

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar en modo desarrollo
npm run dev

# 3. La API estará disponible en: http://localhost:3000
```

---

##  Ejecución de Pruebas

### Ejecutar todas las pruebas

```bash
npm test
```

### Ejecutar pruebas con cobertura detallada

```bash
npm test -- --coverage --verbose
```

### Resultado esperado
```
 PASS  tests/api.test.js
  API de Productos - Pruebas de Integración
    GET /health
      ✓ debe retornar status 200 y estado OK del servidor
    GET /api/productos
      ✓ debe retornar lista de productos con status 200
      ✓ cada producto debe tener las propiedades requeridas
    GET /api/productos/:id
      ✓ debe retornar un producto existente con status 200
      ✓ debe retornar 404 para producto no existente
    

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

---

##  Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Información de la API |
| GET | `/health` | Estado de salud del servidor |
| GET | `/api/productos` | Obtener todos los productos |

### Ejemplos de Uso

#### Obtener todos los productos
```bash
curl http://localhost/api/productos
```

## Switcheo
```bash
.\scripts\switch.ps1 
```

### Opciones de Switcheo
 ```     
==========================================
   Blue-Green Deployment Switch
==========================================

Estado actual:

   BLUE:  Healthy
   GREEN: Healthy

   Activo: BLUE

  Seleccione una opcion (1 a 4)

  1) Cambiar a BLUE
  2) Cambiar a GREEN
  3) Solo verificar estado
  4) Salir
```

##  Comandos Docker Útiles

```bash
# Construir y levantar servicios
docker-compose up --build

# Levantar en segundo plano
docker-compose up -d --build

# Ver logs de los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f api
docker-compose logs -f nginx

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reconstruir sin cache
docker-compose build --no-cache

# Ver estado de los contenedores
docker-compose ps

# Ejecutar comando en un contenedor
docker-compose exec api sh
docker-compose exec nginx sh
```

---

##  Verificación del Proxy Inverso

Una vez levantados los contenedores, puedes verificar que Nginx está funcionando como proxy inverso:

```bash
# Verificar health check de Nginx
curl http://localhost/nginx-health

# Verificar health check de la API (a través de Nginx)
curl http://localhost/health

# Verificar la API de productos
curl http://localhost/api/productos
```
