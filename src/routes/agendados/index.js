const express = require('express');
const router = express.Router();
const { soloLogin } = require('../../middleware/permisos');

router.get('/', soloLogin,                                       require('./lista'));
router.post('/', soloLogin,                                       require('./crear'));
router.post('/editar', soloLogin,                                 require('./editar'));
router.delete('/:nro_viaje_agendado', soloLogin,                  require('./anular'));
router.delete('/:nro_viaje_agendado/item/:fecha_agendado', soloLogin, require('./borrarItem'));

module.exports = router;
