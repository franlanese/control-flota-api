const express = require('express');
const router = express.Router();
const { requierePermiso } = require('../../middleware/permisos');
const { makeFixedUploader } = require('../../middleware/upload');

// El logo es un archivo único de la instalación: siempre public/fotos/empresa/logo.<ext>
const uploadLogo = makeFixedUploader('empresa', 'logo');

router.get('/', requierePermiso('WebConfig'), require('./obtener'));      // ✔️ Réplica de ConfigController@index
router.post('/', requierePermiso('WebConfig'), require('./actualizar'));  // ✔️ Réplica de ConfigController@setValue
router.post('/logo', requierePermiso('WebConfig'), uploadLogo.single('logo'), require('./logo')); // Subida del logo (local)

module.exports = router;
