const express = require('express');
const router = express.Router();

const loginRoute = require('./login');
const puestosRoute = require('./puestos');
const mesasRoute = require('./mesas');

router.post('/login', loginRoute);
router.get('/puestos', puestosRoute);
router.get('/mesas', mesasRoute);

module.exports = router;
