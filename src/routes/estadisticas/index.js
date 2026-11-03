const express = require('express');
const router = express.Router();
const { requierePermiso } = require('../../middleware/permisos');

router.get('/filtros', requierePermiso('WebEstadisticas'), require('./filtros')); // ✔️ Combos de móviles/zonas (CFR_Estadisticas_Filtros)
router.post('/viajesDiasX', requierePermiso('WebEstadisticas'), require('./viajesDiasX')); // ✔️ NU_ViajesDiasX
router.post('/viajesPorOperador', requierePermiso('WebEstadisticas'), require('./viajesPorOperador')); // ✔️ NU_ViajesPorOperador
router.post('/rankViajesMoviles', requierePermiso('WebEstadisticas'), require('./rankViajesMoviles')); // ✔️ NU_RankViajes Tipo=1
router.post('/rankViajesZonas', requierePermiso('WebEstadisticas'), require('./rankViajesZonas')); // ✔️ NU_RankViajes Tipo=2
router.post('/rankViajesMovilesReq', requierePermiso('WebEstadisticas'), require('./rankViajesMovilesReq')); // ✔️ NU_RankViajes Tipo=3

module.exports = router;
