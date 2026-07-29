const express = require('express')
const router = express.Router()

// Importamos todos los controladores
const getViajesRoute = require('./getViajesFlota')
const getMovilesRoute = require('./getMoviles')
const getZonasRoute = require('./getZonas')
const getMapaZonas = require('./getMapaZonas')
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
const cancelarViaje = require('./cancelarViaje')
const getCuentasCorrientes = require('./getCuentasCorrientes')
const getMovilById = require('./getMovilById')
const getReporteGlobal = require('./getReporteGlobal')
const getEventos = require('./getEventos')
const getViajexId = require('./getViajexId')
const getMovilesAutocomplete = require('./getMovilesAutocomplete')
const getAgendados = require('./getAgendados')
const getConsola = require('./getConsola')
const setUltimoVistoConsola = require('./setUltimoVistoConsola')
const getMensajesMovil = require('./getMensajesMovil')
const enviarMensaje = require('./enviarMensaje')
const asignarMovil = require('./asignarMovil')
const ivrConf = require('./ivrConf')
const ivrConfUpdate = require('./ivrConfUpdate')
const ivrConfGetTV = require('./ivrConfGetTV')
const ivrConfUpdateTV = require('./ivrConfUpdateTV')
const enviarViajesPendientesMsj = require('./enviarViajesPendientesMsj')
const pedidosGetPedidosData = require('./pedidosGetPedidosData')
const pedidosCheckTel = require('./pedidosCheckTel')
const pedidosCheckTelReclamo = require('./pedidosCheckTelReclamo')
const pedidosGetCalles = require('./pedidosGetCalles')
const pedidosAddViaje = require('./pedidosAddViaje')
const pedidosAgendarViaje = require('./pedidosAgendarViaje')
const pedidosAddCliente = require('./pedidosAddCliente')
const pedidosUpdateCliente = require('./pedidosUpdateCliente')
const pedidosCalcEstimado = require('./pedidosCalcEstimado')
const pedidosReferenciaHistoricaNumero = require('./pedidosReferenciaHistoricaNumero')
const pedidosReferenciaHistoricaEsquina = require('./pedidosReferenciaHistoricaEsquina')
const pedidosRecalcularImporteSalud = require('./pedidosRecalcularImporteSalud')
const pedidosLogMovCursor = require('./pedidosLogMovCursor')
const pedidosClienteBorrar = require('./pedidosClienteBorrar')
const pedidosGetPlaces = require('./pedidosGetPlaces')
const pedidosSetPlace = require('./pedidosSetPlace')

// Definimos las rutas con sus verbos correspondientes
router.post('/getViajes', getViajesRoute)
router.post('/getMoviles', getMovilesRoute)
router.get('/getZonas', getZonasRoute)
router.get('/getMapaZonas', getMapaZonas)   // ✔️ Mapa: zonas/bases con centro geográfico
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
router.post('/cancelarViaje', cancelarViaje) // ✔️ Anular viaje con motivo (MF_CancelarViaje)
router.get('/getCuentasCorrientes', getCuentasCorrientes)
router.post('/getMovilById', getMovilById)
router.get('/getReporteGlobal', getReporteGlobal) // ✔️ Corregido: removido el punto '.'
router.get('/getEventos', getEventos)             // ✔️ Registrado getEventos
router.post('/getViajexId', getViajexId)          // ✔️ Registrado getViajexId
router.post('/getMovilesAutocomplete', getMovilesAutocomplete) // ✔️ Autocomplete
router.post('/getAgendados', getAgendados)         // ✔️ Agendados
router.post('/getConsola', getConsola)             // ✔️ Consola
router.post('/setUltimoVistoConsola', setUltimoVistoConsola) // ✔️ Set ultimo visto consola
router.post('/getMensajesMovil', getMensajesMovil) // ✔️ Obtener mensajes del móvil
router.post('/enviarMensaje', enviarMensaje)       // ✔️ Enviar mensaje al móvil
router.post('/asignarMovil', asignarMovil)         // ✔️ Asignar móvil a viaje
router.get('/ivrConf', ivrConf)                    // ✔️ Configuración de IVR y WhatsApp
router.post('/ivrConf', ivrConfUpdate)
router.get('/ivrConf/tv', ivrConfGetTV)
router.post('/ivrConf/tv', ivrConfUpdateTV)

// Soporte para endpoints legacy de Laravel
router.post('/getivrconf', ivrConf)
router.post('/updateivrconf', ivrConfUpdate)
router.get('/gettv', ivrConfGetTV)
router.post('/updatetv', ivrConfUpdateTV)

router.post('/enviarViajesPendientesMsj', enviarViajesPendientesMsj) // ✔️ Enviar viajes pendientes a todos los móviles (F9)

// --- Nuevas Rutas de Pedidos (F1 Modal) ---
router.get('/pedidos/getPedidosData', pedidosGetPedidosData)
router.get('/pedidos/checkTel', pedidosCheckTel)
router.get('/pedidos/checkTelReclamo', pedidosCheckTelReclamo)
router.get('/pedidos/getCalles', pedidosGetCalles)
router.post('/pedidos/addViaje', pedidosAddViaje)
router.post('/pedidos/agendarViaje', pedidosAgendarViaje)
router.post('/pedidos/addCliente', pedidosAddCliente)
router.post('/pedidos/updateCliente', pedidosUpdateCliente)
router.get('/pedidos/calcEstimado', pedidosCalcEstimado)
router.get('/pedidos/referenciaHistoricaNumero', pedidosReferenciaHistoricaNumero)
router.post('/pedidos/referenciaHistoricaNumero', pedidosReferenciaHistoricaNumero)
router.get('/pedidos/referenciaHistoricaEsquina', pedidosReferenciaHistoricaEsquina)
router.post('/pedidos/referenciaHistoricaEsquina', pedidosReferenciaHistoricaEsquina)
router.post('/pedidos/recalcularImporteSalud', pedidosRecalcularImporteSalud)
router.post('/pedidos/logMovCursor', pedidosLogMovCursor)
router.post('/pedidos/clienteBorrar', pedidosClienteBorrar)
router.get('/pedidos/getPlaces', pedidosGetPlaces)
router.post('/pedidos/setPlace', pedidosSetPlace)

module.exports = router