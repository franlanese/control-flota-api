const express = require('express');
const router = express.Router();

const lista = require('./lista');

router.post('/lista', lista); // ✔️ Réplica de PagoElectronicoController@getTabla (proxy a la API externa de pagos)

module.exports = router;
