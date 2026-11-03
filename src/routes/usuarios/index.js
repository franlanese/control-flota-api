const express = require('express');
const router = express.Router();
const { requierePermiso, soloLogin } = require('../../middleware/permisos');

router.get('/niveles', requierePermiso('WebUsuarios'),    require('./niveles'));
// Cambio de clave del usuario logueado (modal global del sidebar). Va antes de las rutas
// con ':user_id' para que ninguna de esas lo capture.
router.post('/cambiar-clave', soloLogin, require('./cambiarClave'));
// Herramienta "Cifrar clave" (Configuración): texto → hash bcrypt. No toca la base.
router.post('/cifrar-clave', requierePermiso('WebConfig'), require('./cifrarClave'));
router.get('/', requierePermiso('WebUsuarios'),           require('./lista'));
router.post('/', requierePermiso('WebUsuarios'),          require('./crear'));
router.put('/:user_id', requierePermiso('WebUsuarios'),   require('./actualizar'));
router.delete('/:user_id', requierePermiso('WebUsuarios'), require('./eliminar'));

module.exports = router;
