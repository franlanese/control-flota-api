const express = require('express');
const router = express.Router();
const { requierePermiso, soloLogin } = require('../../middleware/permisos');

router.get('/sonido-alarma', soloLogin, require('./obtenerSonidoAlarma'));
router.put('/sonido-alarma', requierePermiso('WebParametros'), require('./actualizarSonidoAlarma'));

module.exports = router;
