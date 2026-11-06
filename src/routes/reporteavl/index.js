const express = require('express');
const router = express.Router();
const { requierePermiso } = require('../../middleware/permisos');
const { limitePedidos } = require('../../middleware/limitePedidos');

// Tope de actualizaciones del reporte por usuario. El front ya espera 10 s entre clics de
// "Actualizar"; este límite frena lo que el front no controla (F5 repetido, otros clientes).
// Ver docs/decisions/0006, decisión 5.
const MAX_ACTUALIZACIONES_POR_MINUTO = 30;

router.get('/',
    requierePermiso('WebHistoricos'),
    limitePedidos({ max: MAX_ACTUALIZACIONES_POR_MINUTO, ventanaMs: 60 * 1000 }),
    require('./lista'));

module.exports = router;
