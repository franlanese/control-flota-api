const express = require('express');
const router = express.Router();

router.get('/config',                    require('./getConfig'));
router.get('/viajesTotales',             require('./viajesTotales'));
router.get('/lineas',                    require('./lineas'));
router.get('/viajesTotalesPorDia',       require('./viajesTotalesPorDia'));
router.get('/puestosActivos',            require('./puestosActivos'));
router.get('/llamadasActivas',           require('./llamadasActivas'));
router.get('/viajesTotalesPorOperador',  require('./viajesTotalesPorOperador'));
router.get('/viajesDelDiaPorTipo',       require('./viajesDelDiaPorTipo'));
router.get('/movilesPorCanal',           require('./movilesPorCanal'));

module.exports = router;
