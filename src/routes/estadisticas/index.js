const express = require('express');
const router = express.Router();

router.get('/filtros', require('./filtros')); // ✔️ Combos de móviles/zonas (CFR_Estadisticas_Filtros)
router.post('/viajesDiasX', require('./viajesDiasX')); // ✔️ NU_ViajesDiasX
router.post('/viajesPorOperador', require('./viajesPorOperador')); // ✔️ NU_ViajesPorOperador
router.post('/rankViajesMoviles', require('./rankViajesMoviles')); // ✔️ NU_RankViajes Tipo=1
router.post('/rankViajesZonas', require('./rankViajesZonas')); // ✔️ NU_RankViajes Tipo=2
router.post('/rankViajesMovilesReq', require('./rankViajesMovilesReq')); // ✔️ NU_RankViajes Tipo=3

module.exports = router;
