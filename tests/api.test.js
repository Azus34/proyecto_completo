/**
 * Pruebas de Integración con Supertest
 * =====================================
 * Suite de pruebas para validar los endpoints de la API de Productos
 * 
 * Ejecutar: npm test
 */

const request = require('supertest');
const app = require('../src/app');

describe('API de Productos - Pruebas de Integración', () => {
    
    // ==================== PRUEBA 1: Health Check ====================
    describe('GET /health', () => {
        it('debe retornar status 200 y estado OK del servidor', async () => {
            const response = await request(app)
                .get('/health')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('message', 'Servidor funcionando correctamente');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('environment');
        });
    });

    // ==================== PRUEBA 2: Obtener todos los productos ====================
    describe('GET /api/productos', () => {
        it('debe retornar lista de productos con status 200', async () => {
            const response = await request(app)
                .get('/api/productos')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('count');
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.count).toBeGreaterThanOrEqual(0);
        });

        it('cada producto debe tener las propiedades requeridas', async () => {
            const response = await request(app)
                .get('/api/productos')
                .expect(200);

            if (response.body.data.length > 0) {
                const producto = response.body.data[0];
                expect(producto).toHaveProperty('id');
                expect(producto).toHaveProperty('nombre');
                expect(producto).toHaveProperty('precio');
                expect(producto).toHaveProperty('stock');
            }
        });
    });

    // ==================== PRUEBA 3: Obtener producto por ID ====================
    describe('GET /api/productos/:id', () => {
        it('debe retornar un producto existente con status 200', async () => {
            const response = await request(app)
                .get('/api/productos/1')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('id', 1);
        });

        it('debe retornar 404 para producto no existente', async () => {
            const response = await request(app)
                .get('/api/productos/9999')
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message');
        });
    });

    // ==================== PRUEBA 4: Crear nuevo producto ====================
    describe('POST /api/productos', () => {
        it('debe crear un nuevo producto con status 201', async () => {
            const nuevoProducto = {
                nombre: 'Monitor Samsung 27"',
                precio: 5500,
                stock: 15
            };

            const response = await request(app)
                .post('/api/productos')
                .send(nuevoProducto)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Producto creado exitosamente');
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.nombre).toBe(nuevoProducto.nombre);
            expect(response.body.data.precio).toBe(nuevoProducto.precio);
            expect(response.body.data.stock).toBe(nuevoProducto.stock);
        });

        it('debe retornar 400 si falta el nombre del producto', async () => {
            const productoInvalido = {
                precio: 1000,
                stock: 10
            };

            const response = await request(app)
                .post('/api/productos')
                .send(productoInvalido)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.message).toContain('nombre');
        });

        it('debe retornar 400 si el precio es negativo', async () => {
            const productoInvalido = {
                nombre: 'Producto Test',
                precio: -100
            };

            const response = await request(app)
                .post('/api/productos')
                .send(productoInvalido)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
        });
    });

    // ==================== PRUEBA 5: Actualizar producto ====================
    describe('PUT /api/productos/:id', () => {
        it('debe actualizar un producto existente con status 200', async () => {
            const actualizacion = {
                nombre: 'Laptop HP Actualizada',
                precio: 16000
            };

            const response = await request(app)
                .put('/api/productos/1')
                .send(actualizacion)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Producto actualizado exitosamente');
            expect(response.body.data.nombre).toBe(actualizacion.nombre);
            expect(response.body.data.precio).toBe(actualizacion.precio);
        });

        it('debe retornar 404 al actualizar producto inexistente', async () => {
            const response = await request(app)
                .put('/api/productos/9999')
                .send({ nombre: 'Test' })
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body).toHaveProperty('success', false);
        });
    });

    // ==================== PRUEBA 6: Eliminar producto ====================
    describe('DELETE /api/productos/:id', () => {
        it('debe eliminar un producto existente con status 200', async () => {
            // Primero crear un producto para eliminar
            const nuevoProducto = await request(app)
                .post('/api/productos')
                .send({ nombre: 'Producto a Eliminar', precio: 100, stock: 1 });

            const idProducto = nuevoProducto.body.data.id;

            const response = await request(app)
                .delete(`/api/productos/${idProducto}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Producto eliminado exitosamente');
            expect(response.body.data.id).toBe(idProducto);
        });

        it('debe retornar 404 al eliminar producto inexistente', async () => {
            const response = await request(app)
                .delete('/api/productos/9999')
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body).toHaveProperty('success', false);
        });
    });

    // ==================== PRUEBA 7: Ruta principal ====================
    describe('GET /', () => {
        it('debe retornar información de la API', async () => {
            const response = await request(app)
                .get('/')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('version', '1.0.0');
            expect(response.body).toHaveProperty('endpoints');
        });
    });

    // ==================== PRUEBA 8: Ruta no encontrada ====================
    describe('Rutas no existentes', () => {
        it('debe retornar 404 para rutas no definidas', async () => {
            const response = await request(app)
                .get('/ruta-inexistente')
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message', 'Ruta no encontrada');
        });
    });
});
