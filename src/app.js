const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base de datos en memoria (simulación)
let productos = [
    { id: 1, nombre: 'Laptop HP', precio: 15000, stock: 10 },
    { id: 2, nombre: 'Mouse Logitech', precio: 500, stock: 50 },
    { id: 3, nombre: 'Teclado Mecánico', precio: 1200, stock: 25 }
];

let nextId = 4;

// ==================== RUTAS ====================

// Ruta de salud del servidor
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Ruta principal
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'API de Productos - Proyecto de Arquitectura de Despliegue',
        version: '1.0.0',
        endpoints: {
            'GET /': 'Información de la API',
            'GET /health': 'Estado de salud del servidor',
            'GET /api/productos': 'Obtener todos los productos',
            'GET /api/productos/:id': 'Obtener producto por ID',
            'POST /api/productos': 'Crear nuevo producto',
            'PUT /api/productos/:id': 'Actualizar producto',
            'DELETE /api/productos/:id': 'Eliminar producto'
        }
    });
});

// ==================== API PRODUCTOS ====================

// GET - Obtener todos los productos
app.get('/api/productos', (req, res) => {
    res.status(200).json({
        success: true,
        count: productos.length,
        data: productos
    });
});

// GET - Obtener producto por ID
app.get('/api/productos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const producto = productos.find(p => p.id === id);

    if (!producto) {
        return res.status(404).json({
            success: false,
            message: `Producto con ID ${id} no encontrado`
        });
    }

    res.status(200).json({
        success: true,
        data: producto
    });
});

// POST - Crear nuevo producto
app.post('/api/productos', (req, res) => {
    const { nombre, precio, stock } = req.body;

    // Validaciones
    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'El nombre del producto es requerido'
        });
    }

    if (precio === undefined || precio < 0) {
        return res.status(400).json({
            success: false,
            message: 'El precio debe ser un número positivo'
        });
    }

    const nuevoProducto = {
        id: nextId++,
        nombre: nombre.trim(),
        precio: parseFloat(precio),
        stock: parseInt(stock) || 0
    };

    productos.push(nuevoProducto);

    res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: nuevoProducto
    });
});

// PUT - Actualizar producto
app.put('/api/productos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = productos.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: `Producto con ID ${id} no encontrado`
        });
    }

    const { nombre, precio, stock } = req.body;

    if (nombre !== undefined) {
        productos[index].nombre = nombre.trim();
    }
    if (precio !== undefined) {
        productos[index].precio = parseFloat(precio);
    }
    if (stock !== undefined) {
        productos[index].stock = parseInt(stock);
    }

    res.status(200).json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: productos[index]
    });
});

// DELETE - Eliminar producto
app.delete('/api/productos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = productos.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: `Producto con ID ${id} no encontrado`
        });
    }

    const productoEliminado = productos.splice(index, 1)[0];

    res.status(200).json({
        success: true,
        message: 'Producto eliminado exitosamente',
        data: productoEliminado
    });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

// Iniciar servidor solo si no está en modo test
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
        console.log(`📦 API Productos: http://localhost:${PORT}/api/productos`);
    });
}

// Exportar para pruebas
module.exports = app;
