const express = require('express');
const router = express.Router();
const { requierePermiso } = require('../../middleware/permisos');

// Solo WebMovilPosible (no WebMoviles como las rutas de Laravel): docs/decisions/0008, decisión 1.
router.get('/', requierePermiso('WebMovilPosible'), require('./lista'));

module.exports = router;
