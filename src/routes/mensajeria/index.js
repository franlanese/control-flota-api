const express = require('express');
const router = express.Router();
const { requierePermiso } = require('../../middleware/permisos');

router.get('/usuarios', requierePermiso('WebMensajeria'), require('./usuarios'));         // ✔️ Usuarios + grupos (CFR_Mensajeria_Usuarios)
router.get('/lista', requierePermiso('WebMensajeria'), require('./lista'));                // ✔️ Bandeja de entrada/enviados (CFR_Mensajeria_Lista)
router.post('/enviar', requierePermiso('WebMensajeria'), require('./enviar'));              // ✔️ MensajeUsuario_Grabar / _GrabarGrupo
router.get('/sinleer', requierePermiso('WebMensajeria'), require('./sinLeer'));             // ✔️ MensajeUsuario_MensajesSinLeer
router.post('/marcarleido', requierePermiso('WebMensajeria'), require('./marcarLeido'));    // ✔️ MensajeUsuario_MarcarLeido

module.exports = router;
