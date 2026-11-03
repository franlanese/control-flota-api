const express = require('express');
const router = express.Router();
const { requierePermiso } = require('../../middleware/permisos');

const lista = require('./lista');

router.post('/lista', requierePermiso('WebTarjeta'), lista); // ✔️ Réplica de PagoElectronicoController@getTabla (proxy a la API externa de pagos)

module.exports = router;
