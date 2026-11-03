const express = require('express');
const router = express.Router();
const { requierePermiso } = require('../../middleware/permisos');

router.post('/consultar', requierePermiso('WebEditarImp'), require('./consultar'));
router.post('/guardar', requierePermiso('WebEditarImp'), require('./guardar'));

module.exports = router;
