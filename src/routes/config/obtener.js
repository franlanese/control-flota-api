// Réplica de ConfigController@index (Laravel): expone los mismos config('configuracion.X') que
// llenaban el formulario en config/index.blade.php, leídos acá directo de process.env (las
// mismas variables CONF_* que ya usa el resto de la API).
const bool01 = v => v === '1';

module.exports = async (req, res) => {
    const env = process.env;
    res.json({
        success: true,
        data: {
            empresanombre: env.CONF_EMPRESANOMBRE || '',
            empresacod: env.CONF_EMPRESACOD || '',
            empresalogo: env.CONF_EMPRESALOGO || '',
            dnsmoviles: env.CONF_DNSMOVILES || '',

            // Réplica simplificada de 6HORAS/8HORAS (en Laravel son dos flags redundantes que
            // siempre son opuestos) — acá CONF_6HORAS es la única fuente de verdad, ya usada por
            // paneldecontrol/getConfig.js y viajesTotales.js.
            turnos: bool01(env.CONF_6HORAS) ? '6' : '8',

            latitud_inicio_mapa: env.CONF_MAPLAT || '',
            longitud_inicio_mapa: env.CONF_MAPLNG || '',
            default_zoom: env.CONF_MAPZOOM || '',
            emergencia_mapa: bool01(env.CONF_EMERGENCIA),

            cod_localidad: env.CONF_CODLOCALIDAD || '',

            // Réplica de "telefonia": 1=IVR, 2=USB, 0=ninguno (mismo criterio que el radio de Laravel).
            telefonia: bool01(env.CONF_IVR) ? '1' : bool01(env.CONF_USB) ? '2' : '0',
            ivrip: env.CONF_IVRIP || '',
            ivrport: env.CONF_IVRPORT || '',
            ivraudiosport: env.CONF_IVRAUDIOSPORT || '',

            activar_url: env.CONF_ACTIVAR_URL || '',
            desactivar_url: env.CONF_DESACTIVAR_URL || '',
            estado_url: env.CONF_ESTADO_URL || '',

            choferviaja: env.CONF_CHOFERVIAJA || '0',

            conbase: bool01(env.CONF_CONBASE),
            conmesa: bool01(env.CONF_CONMESA),
            conctacte: bool01(env.CONF_CONCTACTE),
            aiko: bool01(env.CONF_AIKO),
            whatsapp: bool01(env.CONF_WHATSAPP),
            app: bool01(env.CONF_APP),
            mensajes_eventos: bool01(env.CONF_MENSAJESEVENTOS),
            alertas: bool01(env.CONF_ALERTAS),
        }
    });
};
