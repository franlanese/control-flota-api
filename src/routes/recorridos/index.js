const express = require('express');
const router = express.Router();
const { requierePermiso } = require('../../middleware/permisos');

router.get('/limites', requierePermiso('WebRecorridos'), require('./limites'));
router.get('/', requierePermiso('WebRecorridos'), require('./lista'));

module.exports = router;
