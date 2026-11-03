const express = require('express');
const router = express.Router();
const { publica, soloLogin } = require('../../middleware/permisos');

const loginRoute = require('./login');
const puestosRoute = require('./puestos');
const mesasRoute = require('./mesas');
const logoutRoute = require('./logout');
const recargaCierreRoute = require('./recargaCierre');
const authMiddleware = require('../../middleware/auth');
const tokenDesdeCuerpo = require('../../middleware/tokenDesdeCuerpo');

router.post('/login', publica, loginRoute);
// /api/auth se monta sin authMiddleware (login y puestos son públicos), así que el logout
// lo pide acá puntualmente: necesita req.user para saber quién cierra la sesión.
router.post('/logout', soloLogin, authMiddleware, logoutRoute);
// La manda navigator.sendBeacon al recargar/cerrar la página. sendBeacon no admite headers,
// así que el token llega como texto plano en el cuerpo: express.text lo lee (el límite es
// de sobra para un JWT) y tokenDesdeCuerpo lo pasa al header que valida authMiddleware.
router.post('/recarga-cierre', soloLogin,
    express.text({ type: 'text/plain', limit: '8kb' }),
    tokenDesdeCuerpo,
    authMiddleware,
    recargaCierreRoute);
router.get('/puestos', publica, puestosRoute);
router.get('/mesas', publica, mesasRoute);

module.exports = router;
