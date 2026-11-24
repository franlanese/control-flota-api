const express = require('express');
const router = express.Router();
const { soloLogin, requierePermiso } = require('../../middleware/permisos');

// Ver: alcanza con estar logueado (en Laravel el grupo permiso:WebMoviles está comentado).
// Crear/editar/borrar: WebEditarAbm (docs/decisions/0014-permiso-editar-abm.md).
const puedeEditar = requierePermiso('WebEditarAbm');

router.get('/titulares', soloLogin, require('./titulares'));
router.get('/canales', soloLogin,   require('./canales'));
router.get('/', soloLogin,          require('./lista'));
router.post('/', puedeEditar,         require('./crear'));
router.put('/:nro_movil', puedeEditar,    require('./actualizar'));
router.delete('/:nro_movil', puedeEditar, require('./eliminar'));

module.exports = router;
