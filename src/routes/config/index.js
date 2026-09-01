const express = require('express');
const router = express.Router();

router.get('/', require('./obtener'));      // ✔️ Réplica de ConfigController@index
router.post('/', require('./actualizar'));  // ✔️ Réplica de ConfigController@setValue

module.exports = router;
