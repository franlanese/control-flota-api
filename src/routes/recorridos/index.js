const express = require('express');
const router = express.Router();
const { requierePermiso } = require('../../middleware/permisos');

// WebMovilPosible también: su modal Recorrido usa este endpoint (docs/decisions/0008, decisión 2).
router.get('/limites', requierePermiso('WebRecorridos', 'WebMovilPosible'), require('./limites'));
router.get('/', requierePermiso('WebRecorridos', 'WebMovilPosible'), require('./lista'));

module.exports = router;
