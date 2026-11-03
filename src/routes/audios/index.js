const express = require('express');
const router = express.Router();
const { requierePermiso } = require('../../middleware/permisos');

router.get('/', requierePermiso('WebAudios'), require('./lista'));

module.exports = router;
