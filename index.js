require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Permitir solicitudes CORS desde el cliente local
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const flotaRoutes = require('./src/routes/flota')

app.use('/api/flota', flotaRoutes)

app.listen(PORT, () => {
    console.log(`Servidor de API corriendo en http://localhost:${PORT}`)
})