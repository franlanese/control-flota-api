const express = require('express');
const router = express.Router();
const { requierePermiso } = require('../../middleware/permisos');
const { makeUploader } = require('../../middleware/upload');

const uploadFotoConductor = makeUploader('conductores', 'nro_conductor');

// Ver: WebConductores. Crear/editar/borrar/foto: WebConductores Y WebEditarAbm
// (dos middlewares encadenados; requierePermiso solo exige uno de los que recibe).
// Los permisos van antes del upload: con 403 la foto no llega a escribirse en disco.
// Ver docs/decisions/0014-permiso-editar-abm.md.
const puedeVer = requierePermiso('WebConductores');
const puedeEditar = [puedeVer, requierePermiso('WebEditarAbm')];

router.get('/', puedeVer,                           require('./lista'));
router.post('/', puedeEditar,                       require('./crear'));
router.put('/:nro_conductor', puedeEditar,          require('./actualizar'));
router.delete('/:nro_conductor', puedeEditar,       require('./eliminar'));
router.post('/:nro_conductor/foto', puedeEditar, uploadFotoConductor.single('foto'), require('./foto'));

module.exports = router;
