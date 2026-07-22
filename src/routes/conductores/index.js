const express = require('express');
const router = express.Router();
const { makeUploader } = require('../../middleware/upload');

const uploadFotoConductor = makeUploader('conductores', 'nro_conductor');

router.get('/',                   require('./lista'));
router.post('/',                  require('./crear'));
router.put('/:nro_conductor',     require('./actualizar'));
router.delete('/:nro_conductor',  require('./eliminar'));
router.post('/:nro_conductor/foto', uploadFotoConductor.single('foto'), require('./foto'));

module.exports = router;
