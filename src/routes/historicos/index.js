const express = require('express')
const router = express.Router()
const { requierePermiso } = require('../../middleware/permisos');

const lista = require('./lista')
const cambiarEstado = require('./cambiarEstado')
const telefonistas = require('./telefonistas')

router.post('/lista', requierePermiso('WebHistoricos', 'WebSalud'), lista)
// Mismo permiso que /lista: es un dato de esa pantalla (no se reusa /mensajeria/usuarios porque
// pide WebMensajeria y le daría 403 a quien solo tiene Históricos).
router.get('/telefonistas', requierePermiso('WebHistoricos', 'WebSalud'), telefonistas)
router.post('/cambiarEstado', requierePermiso('WebHistoricos', 'WebSalud'), cambiarEstado)

module.exports = router
