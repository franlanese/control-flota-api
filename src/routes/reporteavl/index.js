const express = require('express');
const router = express.Router();
const { requierePermiso } = require('../../middleware/permisos');

router.get('/', requierePermiso('WebHistoricos'), require('./lista'));

module.exports = router;
