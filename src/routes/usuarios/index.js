const express = require('express');
const router = express.Router();

router.get('/niveles',    require('./niveles'));
router.get('/',           require('./lista'));
router.post('/',          require('./crear'));
router.put('/:user_id',   require('./actualizar'));
router.delete('/:user_id', require('./eliminar'));

module.exports = router;
