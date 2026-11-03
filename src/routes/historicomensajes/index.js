const express = require('express')
const router = express.Router()
const { requierePermiso } = require('../../middleware/permisos');

const lista = require('./lista')

router.post('/lista', requierePermiso('WebMensajesHist'), lista)

module.exports = router
