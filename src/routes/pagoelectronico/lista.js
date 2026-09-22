const { registrarErrorWeb } = require('../../utils/errorWeb');
// Réplica de PagoElectronicoController@index/@getTabla + @getToken (Laravel): a diferencia del
// resto de la API, esta pantalla NO consulta la base SQL Server — proxea un servicio HTTP
// externo de pagos con tarjeta (CONF_SECONDARY_WEB_SERVICE/CONF_API_KEY/CONF_ID_EMPRESA,
// copiados del .env de Laravel). El login/token se cachea en memoria del proceso (reemplaza la
// sesión PHP de Laravel — acá no hay sesión por usuario, así que se comparte un único token de
// servicio entre todos los operadores, igual de válido porque las credenciales del login
// ('edt'/'tresd') no son por-usuario).
let cachedToken = null;
let cachedExpiration = null;

async function getToken() {
    if (cachedToken && cachedExpiration && new Date(cachedExpiration) > new Date()) {
        return cachedToken;
    }

    const baseUrl = process.env.CONF_SECONDARY_WEB_SERVICE;
    const apiKey = process.env.CONF_API_KEY;
    const idEmpresa = process.env.CONF_ID_EMPRESA;

    const loginUrl = `${baseUrl}/login?usuario=edt&password=tresd&idEmpresa=${idEmpresa}`;
    const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Authorization': apiKey }
    });
    const data = await res.json();

    if (!data || !data.Token || !data.Expiracion) {
        throw new Error('No se pudo obtener un token de la API externa de pagos');
    }

    cachedToken = data.Token;
    cachedExpiration = data.Expiracion;
    return cachedToken;
}

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        // A diferencia de Laravel (que recibe dd/mm/yyyy y lo reconvierte), acá se recibe
        // directo en formato yyyy-mm-dd (el que entrega un <input type="date"> de React), que
        // es el mismo formato que esta API externa espera — sin parseo de fechas de por medio.
        const fechaDesde = body.fecha_desde;
        const fechaHasta = body.fecha_hasta;

        if (!fechaDesde || !fechaHasta) {
            return res.status(400).json({ success: false, error: 'Debe indicar fecha_desde y fecha_hasta' });
        }

        const baseUrl = process.env.CONF_SECONDARY_WEB_SERVICE;
        const idEmpresa = process.env.CONF_ID_EMPRESA;
        const token = await getToken();

        const apiUrl = `${baseUrl}/getListaViajesTarjeta?idEmpresa=${idEmpresa}&fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`;
        const apiRes = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!apiRes.ok) {
            return res.status(apiRes.status).json({ success: false, error: 'Error al obtener los datos del servicio de pagos electrónicos' });
        }

        const data = await apiRes.json();
        // La API externa devuelve el array directo; se deja el fallback por si alguna vez lo
        // envuelve en { data: [...] }, sin asumir cuál de las dos formas es.
        const lista = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);

        res.json({ success: true, data: lista });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en pagoelectronico/lista: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al obtener los pagos electrónicos' });
    }
};
