const express = require('express');
const router = express.Router();
const { requierePermiso } = require('../../middleware/permisos');
const { makeUploader } = require('../../middleware/upload');

const uploadFotoConductor = makeUploader('conductores', 'nro_conductor');

router.get('/', requierePermiso('WebConductores'),                   require('./lista'));
router.post('/', requierePermiso('WebConductores'),                  require('./crear'));
router.put('/:nro_conductor', requierePermiso('WebConductores'),     require('./actualizar'));
router.delete('/:nro_conductor', requierePermiso('WebConductores'),  require('./eliminar'));
router.post('/:nro_conductor/foto', requierePermiso('WebConductores'), uploadFotoConductor.single('foto'), require('./foto'));

module.exports = router;
