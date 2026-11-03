const express = require('express');
const router = express.Router();
const { soloLogin } = require('../../middleware/permisos');

router.get('/titulares', soloLogin, require('./titulares'));
router.get('/canales', soloLogin,   require('./canales'));
router.get('/', soloLogin,          require('./lista'));
router.post('/', soloLogin,         require('./crear'));
router.put('/:nro_movil', soloLogin,    require('./actualizar'));
router.delete('/:nro_movil', soloLogin, require('./eliminar'));

module.exports = router;
