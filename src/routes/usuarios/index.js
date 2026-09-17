const express = require('express');
const router = express.Router();

router.get('/niveles',    require('./niveles'));
// Cambio de clave del usuario logueado (modal global del sidebar). Va antes de las rutas
// con ':user_id' para que ninguna de esas lo capture.
router.post('/cambiar-clave', require('./cambiarClave'));
// Herramienta "Cifrar clave" (Configuración): texto → hash bcrypt. No toca la base.
router.post('/cifrar-clave', require('./cifrarClave'));
router.get('/',           require('./lista'));
router.post('/',          require('./crear'));
router.put('/:user_id',   require('./actualizar'));
router.delete('/:user_id', require('./eliminar'));

module.exports = router;
