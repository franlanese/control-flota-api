const express = require('express');
const router = express.Router();
const { makeUploader } = require('../../middleware/upload');

const uploadFotoTitular = makeUploader('titulares', 'nro_titular');

router.get('/',                 require('./lista'));
router.post('/',                require('./crear'));
router.put('/:nro_titular',     require('./actualizar'));
router.delete('/:nro_titular',  require('./eliminar'));
router.post('/:nro_titular/foto', uploadFotoTitular.single('foto'), require('./foto'));

module.exports = router;
