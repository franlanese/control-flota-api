const express = require('express');
const router = express.Router();
const { requierePermiso, soloLogin } = require('../../middleware/permisos');
const generar = require('./generar');

// Permisos según routes/web.php. Chofer está en un grupo de Laravel que solo exige login, y el
// detalle queda igual porque ese grupo también lo expone (getLiqViajes de LiqChoferController).
router.get('/pendientes', requierePermiso('WebTarjeta'), require('./pendientes'));
router.post('/pendientes/:idLiquidacion/abonar', requierePermiso('WebTarjeta'), require('./abonar'));
router.get('/confirmadas', requierePermiso('WebTarjeta'), require('./confirmadas'));
router.get('/viajes-pendientes', requierePermiso('WebTarjeta'), require('./viajesPendientes'));
router.get('/chofer', soloLogin, require('./chofer'));
router.get('/items/:idLiquidacion', soloLogin, require('./items'));
router.post('/generar/consultar', requierePermiso('WebGenerarLiq'), generar.consultar);
router.get('/generar/viajes', requierePermiso('WebGenerarLiq'), generar.viajes);
router.post('/generar/liquidar', requierePermiso('WebGenerarLiq'), generar.liquidar);

module.exports = router;
