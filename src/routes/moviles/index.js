const express = require('express');
const router = express.Router();

router.get('/titulares', require('./titulares'));
router.get('/canales',   require('./canales'));
router.get('/',          require('./lista'));
router.post('/',         require('./crear'));
router.put('/:nro_movil',    require('./actualizar'));
router.delete('/:nro_movil', require('./eliminar'));

module.exports = router;
