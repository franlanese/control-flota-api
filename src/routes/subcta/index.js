const express = require('express');
const router = express.Router();
const { requierePermiso } = require('../../middleware/permisos');

router.get('/', requierePermiso('WebCtaCte'),  require('./lista'));
router.post('/', requierePermiso('WebCtaCte'), require('./crear'));
router.put('/:nroCtaCte/:nroDivision/:nroSubcta', requierePermiso('WebCtaCte'),    require('./actualizar'));
router.delete('/:nroCtaCte/:nroDivision/:nroSubcta', requierePermiso('WebCtaCte'), require('./eliminar'));

module.exports = router;
