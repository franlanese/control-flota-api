const express = require('express');
const router = express.Router();
const { requierePermiso } = require('../../middleware/permisos');
const { makeUploader } = require('../../middleware/upload');

const uploadFotoTitular = makeUploader('titulares', 'nro_titular');

// Ver: WebTitulares. Crear/editar/borrar/foto: WebTitulares Y WebEditarAbm. En Laravel el
// chequeo de WebEditarAbm de titulares está comentado; se aplica igual para que las tres
// pantallas ABM se comporten igual (docs/decisions/0014-permiso-editar-abm.md, decisión 2).
// Los permisos van antes del upload: con 403 la foto no llega a escribirse en disco.
const puedeVer = requierePermiso('WebTitulares');
const puedeEditar = [puedeVer, requierePermiso('WebEditarAbm')];

router.get('/', puedeVer,                         require('./lista'));
router.post('/', puedeEditar,                     require('./crear'));
router.put('/:nro_titular', puedeEditar,          require('./actualizar'));
router.delete('/:nro_titular', puedeEditar,       require('./eliminar'));
router.post('/:nro_titular/foto', puedeEditar, uploadFotoTitular.single('foto'), require('./foto'));

module.exports = router;
