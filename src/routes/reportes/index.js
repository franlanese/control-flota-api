const express = require('express');
const router = express.Router();

router.post('/llamadasPorHora', require('./llamadasPorHora')); // ✔️ Rep_LlamadasxHora
router.post('/totalesViajesPorMes', require('./totalesViajesPorMes')); // ✔️ Rep_xTipoViaje
router.post('/reporteTelefonistas', require('./reporteTelefonistas')); // ⚠️ Rep_ReporteTelefonistas (no existe en la base Demo)

// TODO: "Búsqueda de Llamadas" y "Registros por ID de Llamada" (ReportesController@busquedaLlamada
// / @registrosPorIdLlamada en Laravel) consultan una segunda base de datos MySQL separada
// (conexión "mysqlIVR" en config/database.php) con el historial de llamadas del IVR. No se portó:
// esa conexión no está armada en este proyecto (no hay driver mysql2, ni pool, ni credenciales
// reales — el .env de Laravel ni siquiera tiene DB_HOST_IVR/DB_USERNAME_IVR/DB_PASSWORD_IVR seteados,
// caen en los defaults de Forge). Si se quiere portar esto: agregar la dependencia `mysql2`, armar
// un segundo pool de conexión (ver db.js para el patrón del pool de mssql) con las credenciales
// reales del server de IVR, y replicar las dos queries de ReportesController@busquedaLlamada /
// @registrosPorIdLlamada contra esa conexión.

module.exports = router;
