const express = require('express');
const router = express.Router();

router.post('/lista', require('./lista')); // ✔️ Réplica de RechazosController@getTabla (CFR_Rechazos_Lista)

module.exports = router;
