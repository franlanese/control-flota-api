const express = require('express');
const router = express.Router();
const { requierePermiso } = require('../../middleware/permisos');
const { makeUploader } = require('../../middleware/upload');

const uploadFotoTitular = makeUploader('titulares', 'nro_titular');

router.get('/', requierePermiso('WebTitulares'),                 require('./lista'));
router.post('/', requierePermiso('WebTitulares'),                require('./crear'));
router.put('/:nro_titular', requierePermiso('WebTitulares'),     require('./actualizar'));
router.delete('/:nro_titular', requierePermiso('WebTitulares'),  require('./eliminar'));
router.post('/:nro_titular/foto', requierePermiso('WebTitulares'), uploadFotoTitular.single('foto'), require('./foto'));

module.exports = router;
