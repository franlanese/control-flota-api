const express = require('express');
const router = express.Router();
const { soloLogin } = require('../../middleware/permisos');

router.get('/config', soloLogin,                    require('./getConfig'));
router.get('/viajesTotales', soloLogin,             require('./viajesTotales'));
router.get('/lineas', soloLogin,                    require('./lineas'));
router.get('/viajesTotalesPorDia', soloLogin,       require('./viajesTotalesPorDia'));
router.get('/puestosActivos', soloLogin,            require('./puestosActivos'));
router.get('/llamadasActivas', soloLogin,           require('./llamadasActivas'));
router.get('/viajesTotalesPorOperador', soloLogin,  require('./viajesTotalesPorOperador'));
router.get('/viajesDelDiaPorTipo', soloLogin,       require('./viajesDelDiaPorTipo'));
router.get('/movilesPorCanal', soloLogin,           require('./movilesPorCanal'));

module.exports = router;
