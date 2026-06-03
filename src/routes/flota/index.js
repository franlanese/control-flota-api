const express = require('express')
const router = express.Router()

// Importamos todos los controladores
const getViajesRoute = require('./getViajesFlota')
const getMovilesRoute = require('./getMoviles')
const getZonasRoute = require('./getZonas')
const consultarEstadoZona = require('./consultarEstadoZona')
const ponerPrimero = require('./ponerPrimero')
const suspenderMovil = require('./suspenderMovil')
const desuspenderMovil = require('./desuspenderMovil')
const quitarAsignado = require('./quitarAsignado')
const getStatsMin = require('./getStatsMin')
const getSemaforos = require('./getSemaforos')
const getTiempoAsignacion = require('./getTiempoAsignacion')
const getMovilesCercanos = require('./getMovilesCercanos')
const lineasSinAtender = require('./lineasSinAtender')
const getPosicionesViajexId = require('./getPosicionesViajexId')
const accionesEventos = require('./accionesEventos')
const getCuentasCorrientes = require('./getCuentasCorrientes')
const getMovilById = require('./getMovilById')
const getReporteGlobal = require('./getReporteGlobal')
const getEventos = require('./getEventos')
const getViajexId = require('./getViajexId')
const getMovilesAutocomplete = require('./getMovilesAutocomplete')
const getAgendados = require('./getAgendados')
const getConsola = require('./getConsola')

// Definimos las rutas con sus verbos correspondientes
router.post('/getViajes', getViajesRoute)
router.post('/getMoviles', getMovilesRoute)
router.get('/getZonas', getZonasRoute)
router.post('/consultarEstadoZona', consultarEstadoZona)
router.post('/ponerPrimero', ponerPrimero)
router.post('/suspenderMovil', suspenderMovil)
router.post('/desuspenderMovil', desuspenderMovil)
router.post('/quitarAsignado', quitarAsignado)
router.post('/getStatsMin', getStatsMin)
router.get('/getSemaforos', getSemaforos)
router.get('/getTiempoAsignacion', getTiempoAsignacion)
router.post('/getMovilesCercanos', getMovilesCercanos)
router.get('/lineasSinAtender', lineasSinAtender)
router.post('/getPosicionesViajexId', getPosicionesViajexId)
router.post('/accionesEventos', accionesEventos)
router.get('/getCuentasCorrientes', getCuentasCorrientes)
router.post('/getMovilById', getMovilById)
router.get('/getReporteGlobal', getReporteGlobal) // ✔️ Corregido: removido el punto '.'
router.get('/getEventos', getEventos)             // ✔️ Registrado getEventos
router.post('/getViajexId', getViajexId)          // ✔️ Registrado getViajexId
router.post('/getMovilesAutocomplete', getMovilesAutocomplete) // ✔️ Autocomplete
router.post('/getAgendados', getAgendados)         // ✔️ Agendados
router.post('/getConsola', getConsola)             // ✔️ Consola

module.exports = router