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
            expect(response.body).toHaveProperty('version');
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
            
            // Verificar estructura de productos
            if (response.body.data.length > 0) {
                const producto = response.body.data[0];
                expect(producto).toHaveProperty('id');
                expect(producto).toHaveProperty('nombre');
                expect(producto).toHaveProperty('precio');
                expect(producto).toHaveProperty('stock');
            }
        });
    });

    // ==================== PRUEBA 3: Crear nuevo producto ====================
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
    });
});
