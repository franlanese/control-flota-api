const express = require('express');
const router = express.Router();
const { requierePermiso } = require('../../middleware/permisos');

router.post('/lista', requierePermiso('WebRechazos'), require('./lista')); // ✔️ Réplica de RechazosController@getTabla (CFR_Rechazos_Lista)

module.exports = router;
