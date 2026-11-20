const express = require('express');
const router = express.Router();
const { soloLogin, requierePermiso } = require('../../middleware/permisos');

router.get('/', soloLogin,                                       require('./lista'));
// Va antes de las rutas con :param. Mismo permiso que el grupo Agendados de Laravel.
router.get('/proximos', requierePermiso('WebAgendados', 'WebSalud'), require('./proximos'));
router.post('/', soloLogin,                                       require('./crear'));
router.post('/editar', soloLogin,                                 require('./editar'));
// Fuera de grupos de permiso en Laravel (/modificarAgendado): sólo requiere login.
router.put('/:nro_viaje_agendado/fecha', soloLogin,              require('./modificar'));
router.delete('/:nro_viaje_agendado', soloLogin,                  require('./anular'));
router.delete('/:nro_viaje_agendado/item/:fecha_agendado', soloLogin, require('./borrarItem'));

module.exports = router;
