const { registrarErrorWeb } = require('../../utils/errorWeb');
const { setEnvValues } = require('../../utils/envFile');

// Réplica de ConfigController@setValue (Laravel). A propósito NO recibe {key, value} genérico
// del body — cada campo del form se mapea acá mismo a su variable CONF_* fija, igual que hacía
// Laravel con cada `if ($campo != config(...))`. Así el cliente nunca puede pedir sobreescribir
// una variable de entorno arbitraria (ej. JWT_SECRET, DB_PASSWORD) a través de este endpoint.
module.exports = async (req, res) => {
    try {
        const b = req.body || {};
        const texto = v => (v === undefined || v === null ? '' : String(v).trim());
        const bit = v => (v ? '1' : '0');

        const updates = {
            CONF_EMPRESANOMBRE: texto(b.empresanombre),
            CONF_EMPRESACOD: texto(b.empresacod),
            CONF_EMPRESALOGO: texto(b.empresalogo),
            CONF_DNSMOVILES: texto(b.dnsmoviles),

            // turnos: '6' u '8' — única fuente de verdad CONF_6HORAS (ver nota en obtener.js).
            CONF_6HORAS: bit(b.turnos === '6'),

            CONF_MAPLAT: texto(b.latitud_inicio_mapa),
            CONF_MAPLNG: texto(b.longitud_inicio_mapa),
            CONF_MAPZOOM: texto(b.default_zoom),
            CONF_EMERGENCIA: bit(b.emergencia_mapa),

            CONF_CODLOCALIDAD: texto(b.cod_localidad),

            // telefonia: '1'=IVR, '2'=USB, '0'=ninguno.
            CONF_IVR: bit(b.telefonia === '1'),
            CONF_USB: bit(b.telefonia === '2'),
            CONF_IVRIP: texto(b.ivrip),
            CONF_IVRPORT: texto(b.ivrport),
            CONF_IVRAUDIOSPORT: texto(b.ivraudiosport),

            CONF_ACTIVAR_URL: texto(b.activar_url),
            CONF_DESACTIVAR_URL: texto(b.desactivar_url),
            CONF_ESTADO_URL: texto(b.estado_url),

            // choferviaja: '0'=EDT chofer, '1'=Viaja chofer, '2'=Viaja Rosario chofer.
            CONF_CHOFERVIAJA: texto(b.choferviaja) || '0',

            CONF_CONBASE: bit(b.conbase),
            CONF_CONMESA: bit(b.conmesa),
            CONF_CONCTACTE: bit(b.conctacte),
            CONF_AIKO: bit(b.aiko),
            CONF_WHATSAPP: bit(b.whatsapp),
            CONF_APP: bit(b.app),
            CONF_MENSAJESEVENTOS: bit(b.mensajes_eventos),
            CONF_ALERTAS: bit(b.alertas),
        };

        setEnvValues(updates);

        res.json({ success: true, mensaje: 'Configuración actualizada correctamente' });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en config/actualizar: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al guardar la configuración' });
    }
};
