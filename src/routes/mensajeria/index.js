const express = require('express');
const router = express.Router();

router.get('/usuarios', require('./usuarios'));         // ✔️ Usuarios + grupos (CFR_Mensajeria_Usuarios)
router.get('/lista', require('./lista'));                // ✔️ Bandeja de entrada/enviados (CFR_Mensajeria_Lista)
router.post('/enviar', require('./enviar'));              // ✔️ MensajeUsuario_Grabar / _GrabarGrupo
router.get('/sinleer', require('./sinLeer'));             // ✔️ MensajeUsuario_MensajesSinLeer
router.post('/marcarleido', require('./marcarLeido'));    // ✔️ MensajeUsuario_MarcarLeido

module.exports = router;
