require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar orígenes permitidos para CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:5000', 'http://localhost:7400'];

app.use(cors({
    origin: (origin, callback) => {
        // Permitir solicitudes sin origen (como curl o Postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes('*') || allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        
        // Si no está definido ALLOWED_ORIGINS en el .env, permitimos todo por defecto en desarrollo
        if (!process.env.ALLOWED_ORIGINS) {
            return callback(null, true);
        }
        
        return callback(new Error('Bloqueado por la política de CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Fotos de perfil (conductores/titulares) servidas como archivos estáticos
app.use('/fotos', express.static(path.join(__dirname, 'public', 'fotos')));

const authRoutes       = require('./src/routes/auth');
const flotaRoutes      = require('./src/routes/flota');
const panelRoutes      = require('./src/routes/paneldecontrol');
const movilesRoutes    = require('./src/routes/moviles');
const conductoresRoutes = require('./src/routes/conductores');
const titularesRoutes  = require('./src/routes/titulares');
const reporteAvlRoutes = require('./src/routes/reporteavl');
const usuariosRoutes   = require('./src/routes/usuarios');
const puestosRoutes    = require('./src/routes/puestos');
const audiosRoutes     = require('./src/routes/audios');
const agendadosRoutes  = require('./src/routes/agendados');
const historicosRoutes = require('./src/routes/historicos');
const historicoMensajesRoutes = require('./src/routes/historicomensajes');
const pagoElectronicoRoutes = require('./src/routes/pagoelectronico');
const rechazosRoutes = require('./src/routes/rechazos');
const reportesRoutes = require('./src/routes/reportes');
const estadisticasRoutes = require('./src/routes/estadisticas');
const configRoutes = require('./src/routes/config');
const mensajeriaRoutes = require('./src/routes/mensajeria');
const authMiddleware   = require('./src/middleware/auth');

// Rutas públicas de autenticación
app.use('/api/auth', authRoutes);

// Rutas protegidas de flota
app.use('/api/flota', authMiddleware, flotaRoutes);

// Rutas protegidas de panel de control
app.use('/api/paneldecontrol', authMiddleware, panelRoutes);

// Rutas protegidas de móviles
app.use('/api/moviles', authMiddleware, movilesRoutes);

// Rutas protegidas de conductores
app.use('/api/conductores', authMiddleware, conductoresRoutes);

// Rutas protegidas de titulares
app.use('/api/titulares', authMiddleware, titularesRoutes);

// Rutas protegidas de reporte AVL (solo lectura)
app.use('/api/reporteavl', authMiddleware, reporteAvlRoutes);

// Rutas protegidas de usuarios
app.use('/api/usuarios', authMiddleware, usuariosRoutes);

// Rutas protegidas de puestos (ABM completo)
app.use('/api/puestos', authMiddleware, puestosRoutes);

// Rutas protegidas de audios IVR (proxy)
app.use('/api/audios', authMiddleware, audiosRoutes);

// Rutas protegidas de agendados
app.use('/api/agendados', authMiddleware, agendadosRoutes);

// Rutas protegidas de históricos (búsqueda de viajes históricos)
app.use('/api/historicos', authMiddleware, historicosRoutes);

// Rutas protegidas de histórico de mensajes
app.use('/api/historicomensajes', authMiddleware, historicoMensajesRoutes);

// Rutas protegidas de Pago Electrónico (proxy a API externa de pagos con tarjeta)
app.use('/api/pagoelectronico', authMiddleware, pagoElectronicoRoutes);

// Rutas protegidas de Rechazos / Reportes / Estadísticas
app.use('/api/rechazos', authMiddleware, rechazosRoutes);
app.use('/api/reportes', authMiddleware, reportesRoutes);
app.use('/api/estadisticas', authMiddleware, estadisticasRoutes);

// Rutas protegidas de Configuración (lee/escribe .env — WebConfig / admin)
app.use('/api/config', authMiddleware, configRoutes);

// Rutas protegidas de Mensajería interna (modal global, F3)
app.use('/api/mensajeria', authMiddleware, mensajeriaRoutes);

app.listen(PORT, () => {
    console.log(`Servidor de API corriendo en http://localhost:${PORT}`)
})