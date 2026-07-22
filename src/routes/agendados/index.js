const express = require('express');
const router = express.Router();

router.get('/',                                       require('./lista'));
router.post('/',                                       require('./crear'));
router.post('/editar',                                 require('./editar'));
router.delete('/:nro_viaje_agendado',                  require('./anular'));
router.delete('/:nro_viaje_agendado/item/:fecha_agendado', require('./borrarItem'));

module.exports = router;
