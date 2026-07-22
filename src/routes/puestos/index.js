const express = require('express');
const router = express.Router();

router.get('/',              require('./lista'));
router.post('/',              require('./crear'));
router.put('/:id_puesto',     require('./actualizar'));
router.delete('/:id_puesto',  require('./eliminar'));

module.exports = router;
