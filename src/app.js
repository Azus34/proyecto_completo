const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Base de datos en memoria (simulación)
let productos = [
    { id: 1, nombre: 'Laptop HP', precio: 15000, stock: 10 },
    { id: 2, nombre: 'Mouse Logitech', precio: 500, stock: 50 },
    { id: 3, nombre: 'Teclado Mecánico', precio: 1200, stock: 25 }
];

let nextId = 4;

// ==================== RUTAS ====================

// Ruta de salud del servidor (con versión para Blue-Green)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Servidor funcionando correctamente',
        mes: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || 'DEFAULT'
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

// POST - Crear nuevo producto
app.post('/api/productos', (req, res) => {
    const { nombre, precio, stock } = req.body;

    const nuevoProducto = {
        id: nextId++,
        nombre: nombre,
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
