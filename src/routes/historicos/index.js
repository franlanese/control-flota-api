const express = require('express')
const router = express.Router()

const lista = require('./lista')
const cambiarEstado = require('./cambiarEstado')

router.post('/lista', lista)
router.post('/cambiarEstado', cambiarEstado)

module.exports = router
