const express = require('express');
const router = express.Router();
const { requierePermiso } = require('../../middleware/permisos');

router.get('/', requierePermiso('WebCtaCte'),                require('./lista'));
router.post('/', requierePermiso('WebCtaCte'),               require('./crear'));
router.put('/:nro_ctacte', requierePermiso('WebCtaCte'),     require('./actualizar'));
router.delete('/:nro_ctacte', requierePermiso('WebCtaCte'),  require('./eliminar'));

module.exports = router;
