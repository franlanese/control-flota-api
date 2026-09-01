const express = require('express')
const router = express.Router()

const lista = require('./lista')

router.post('/lista', lista)

module.exports = router
