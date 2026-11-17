require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// En producción el API corre detrás de nginx (mismo servidor). Con esto Express toma la IP
// del cliente del header X-Forwarded-For, pero SÓLO cuando el pedido llega desde loopback,
// o sea desde nuestro propio nginx. No usar `true`: confiaría en ese header venga de donde
// venga, y cualquiera podría falsear la IP que queda en el log de accesos.
app.set('trust proxy', 'loopback');

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
const feriadosRoutes   = require('./src/routes/feriados');
const recorridosRoutes = require('./src/routes/recorridos');
const audiosRoutes     = require('./src/routes/audios');
const agendadosRoutes  = require('./src/routes/agendados');
const historicosRoutes = require('./src/routes/historicos');
const historicoMensajesRoutes = require('./src/routes/historicomensajes');
const pagoElectronicoRoutes = require('./src/routes/pagoelectronico');
const liquidacionesRoutes = require('./src/routes/liquidaciones');
const editarImportesRoutes = require('./src/routes/editarimportes');
const rechazosRoutes = require('./src/routes/rechazos');
const reportesRoutes = require('./src/routes/reportes');
const estadisticasRoutes = require('./src/routes/estadisticas');
const configRoutes = require('./src/routes/config');
const parametrosRoutes = require('./src/routes/parametros');
const mensajeriaRoutes = require('./src/routes/mensajeria');
const authMiddleware   = require('./src/middleware/auth');
const { registrarErrorWeb } = require('./src/utils/errorWeb');
const { verificarPermisosRutas } = require('./src/utils/verificarPermisosRutas');
const { conCtaCte } = require('./src/utils/conCtaCte');

// Monta cada namespace y lo anota para el chequeo de permisos de arranque (verificarPermisosRutas).
// Usar montar() en vez de app.use() para que las rutas nuevas también se revisen.
const montajes = [];
const montar = (prefijo, ...handlers) => {
    app.use(prefijo, ...handlers);
    montajes.push([prefijo, handlers[handlers.length - 1]]);
};

// Rutas públicas de autenticación
montar('/api/auth', authRoutes);

// Rutas protegidas de flota
montar('/api/flota', authMiddleware, flotaRoutes);

// Rutas protegidas de panel de control
montar('/api/paneldecontrol', authMiddleware, panelRoutes);

// Rutas protegidas de móviles
montar('/api/moviles', authMiddleware, movilesRoutes);

// Rutas protegidas de conductores
montar('/api/conductores', authMiddleware, conductoresRoutes);

// Rutas protegidas de titulares
montar('/api/titulares', authMiddleware, titularesRoutes);

// Rutas protegidas de reporte AVL (solo lectura)
montar('/api/reporteavl', authMiddleware, reporteAvlRoutes);

// Rutas protegidas de usuarios
montar('/api/usuarios', authMiddleware, usuariosRoutes);

// Rutas protegidas de puestos (ABM completo)
montar('/api/puestos', authMiddleware, puestosRoutes);

// Rutas protegidas de feriados (ABM completo)
montar('/api/feriados', authMiddleware, feriadosRoutes);

// Rutas protegidas de recorridos (recorrido de un móvil en un rango de fechas)
montar('/api/recorridos', authMiddleware, recorridosRoutes);

// Rutas protegidas de audios IVR (proxy)
montar('/api/audios', authMiddleware, audiosRoutes);

// Rutas protegidas de agendados
montar('/api/agendados', authMiddleware, agendadosRoutes);

// Rutas protegidas de históricos (búsqueda de viajes históricos)
montar('/api/historicos', authMiddleware, historicosRoutes);

// Rutas protegidas de histórico de mensajes
montar('/api/historicomensajes', authMiddleware, historicoMensajesRoutes);

// Rutas protegidas de Pago Electrónico (proxy a API externa de pagos con tarjeta)
montar('/api/pagoelectronico', authMiddleware, pagoElectronicoRoutes);

// Rutas protegidas de Liquidaciones (proxy al servicio externo)
montar('/api/liquidaciones', authMiddleware, liquidacionesRoutes);

// Rutas protegidas de Editar Importes
montar('/api/editarimportes', authMiddleware, editarImportesRoutes);

// Rutas protegidas de CtaCtes y SubCtas. Igual que routes/web.php: con CONF_CONCTACTE en 0 no existen.
if (conCtaCte()) {
    montar('/api/ctacte', authMiddleware, require('./src/routes/ctacte'));
    montar('/api/subcta', authMiddleware, require('./src/routes/subcta'));
}

// Rutas protegidas de Rechazos / Reportes / Estadísticas
montar('/api/rechazos', authMiddleware, rechazosRoutes);
montar('/api/reportes', authMiddleware, reportesRoutes);
montar('/api/estadisticas', authMiddleware, estadisticasRoutes);

// Rutas protegidas de Configuración (lee/escribe .env — WebConfig / admin)
montar('/api/config', authMiddleware, configRoutes);

// Rutas protegidas de parámetros (por ahora sólo el sonido de la alarma)
montar('/api/parametros', authMiddleware, parametrosRoutes);

// Rutas protegidas de Mensajería interna (modal global, F3)
montar('/api/mensajeria', authMiddleware, mensajeriaRoutes);

// Rutas protegidas de Móvil Posible (qué móviles pasaron por un punto en una fecha y hora)
montar('/api/movilposible', authMiddleware, require('./src/routes/movilposible'));

// CHEQUEO DE HEALTH (decisión 0011)
// Readiness: 'ok' significa que el API responde Y que SQL Server contesta. El monitor que lo
// consume alerta ante un 503 (no reinicia el proceso), así que una caída de la base avisa sin
// provocar reinicios en loop.

// Revisión desplegada. El deploy escribe el archivo REVISION; se busca primero dentro del API y
// después en la carpeta de arriba, y se loguea cuál se usó para que un 'dev' en producción se note.
let REVISION = 'dev';
for (const archivo of [path.join(__dirname, 'REVISION'), path.join(__dirname, '..', 'REVISION')]) {
    try {
        REVISION = fs.readFileSync(archivo, 'utf8').trim() || 'dev';
        console.log(`Revisión ${REVISION} (leída de ${archivo})`);
        break;
    } catch { /* probar la siguiente ubicación */ }
}
if (REVISION === 'dev') console.warn('No se encontró el archivo REVISION: /health informa revision "dev"');

// Más corto que el timeout típico de un monitor (5-10 s): si la base está colgada, el monitor
// tiene que recibir un 503 claro y no un "sin respuesta".
const HEALTH_DB_TIMEOUT_MS = 3000;

const { poolPromise } = require('./db');

// Corre `promesa` con un límite de tiempo; si vence, rechaza. Cubre tanto una query colgada como
// el pool esperando una conexión libre (que en mssql puede tardar mucho más).
const conTimeout = (promesa, ms) => {
    let timer;
    const limite = new Promise((_, rechazar) => {
        timer = setTimeout(() => rechazar(new Error(`timeout de ${ms} ms`)), ms);
    });
    return Promise.race([promesa, limite]).finally(() => clearTimeout(timer));
};

const health = async (_req, res) => {
    // Nunca cachear: un proxy no puede devolverle al monitor un 'ok' viejo.
    res.set('Cache-Control', 'no-store');
    try {
        await conTimeout(poolPromise.then(pool => pool.request().query('SELECT 1 AS ok')), HEALTH_DB_TIMEOUT_MS);
        res.json({ status: 'ok', revision: REVISION, db: 'ok' });
    } catch (err) {
        // El detalle va al log del servidor, no a la respuesta: el endpoint es público.
        console.error('Health check: la base no responde:', err.message);
        res.status(503).json({ status: 'error', revision: REVISION, db: 'down' });
    }
};

// Pública (sin authMiddleware): un monitor no tiene token. También bajo /api/ para que sea
// accesible a través de nginx si sólo reenvía /api/ al Node.
app.get(['/health', '/api/health'], health);

// Manejador global de errores, equivalente a app/Exceptions/Handler.php de Laravel: registra el
// error en EVENTOS_ERRORWEB (sólo si es de base de datos) y responde 500.
// Tiene que ir DESPUÉS de todas las rutas y llevar los 4 parámetros: así Express lo reconoce como
// manejador de errores y no como un middleware común.
// eslint-disable-next-line no-unused-vars
app.use(async (err, req, res, next) => {
    await registrarErrorWeb(err, req);
    console.error('Error no controlado:', err.message);
    // Si el handler ya empezó a responder, Express tiene que cerrar él la conexión.
    if (res.headersSent) return next(err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
});

verificarPermisosRutas(montajes);

app.listen(PORT, () => {
    if (process.send) process.send('ready');
    console.log(`Servidor de API corriendo en http://localhost:${PORT}`)
})