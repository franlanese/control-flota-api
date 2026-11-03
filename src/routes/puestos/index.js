const express = require('express');
const router = express.Router();
const { requierePermiso } = require('../../middleware/permisos');

router.get('/', requierePermiso('WebPuestos'),              require('./lista'));
router.post('/', requierePermiso('WebPuestos'),              require('./crear'));
router.put('/:id_puesto', requierePermiso('WebPuestos'),     require('./actualizar'));
router.delete('/:id_puesto', requierePermiso('WebPuestos'),  require('./eliminar'));

module.exports = router;
