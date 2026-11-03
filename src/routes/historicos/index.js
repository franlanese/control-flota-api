const express = require('express')
const router = express.Router()
const { requierePermiso } = require('../../middleware/permisos');

const lista = require('./lista')
const cambiarEstado = require('./cambiarEstado')

router.post('/lista', requierePermiso('WebHistoricos', 'WebSalud'), lista)
router.post('/cambiarEstado', requierePermiso('WebHistoricos', 'WebSalud'), cambiarEstado)

module.exports = router
