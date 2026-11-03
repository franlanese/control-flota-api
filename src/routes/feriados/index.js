const express = require('express');
const router = express.Router();
const { requierePermiso } = require('../../middleware/permisos');

router.get('/', requierePermiso('WebFeriados'),            require('./lista'));
router.post('/', requierePermiso('WebFeriados'),           require('./crear'));
router.put('/:fecha', requierePermiso('WebFeriados'),      require('./actualizar'));
router.delete('/:fecha', requierePermiso('WebFeriados'),   require('./eliminar'));

module.exports = router;
