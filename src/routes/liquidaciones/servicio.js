// Cliente del servicio externo de liquidaciones (CONF_SECONDARY_WEB_SERVICE), compartido por las
// pantallas de Liquidaciones. Esta sección no consulta SQL Server salvo para el filtro por flota.
//
// La autenticación replica a Laravel tal cual (docs/decisions/0004): Pendientes, Confirmadas y
// Chofer mandan un Bearer fijo, y Generar manda la API key. Son valores del lado del servidor:
// nunca llegan al navegador.
const TOKEN_FIJO = 'estoesparaprobar';   // getToken() de LiqPendientes/Confirmadas/ChoferController
const TIMEOUT_MS = 30000;                // el mismo tope que el cliente Http de Laravel

const authBearer = () => `Bearer ${TOKEN_FIJO}`;
const authApiKey = () => process.env.CONF_API_KEY;

// POST al servicio, con los parámetros en la query string como hace Laravel. Si se vence el
// tiempo, lanza un error con name 'TimeoutError'.
async function llamarServicio(ruta, params, authorization) {
    const base = String(process.env.CONF_SECONDARY_WEB_SERVICE || '').replace(/\/+$/, '');
    const query = new URLSearchParams({ idEmpresa: process.env.CONF_ID_EMPRESA, ...params });
    const resp = await fetch(`${base}/${ruta}?${query}`, {
        method: 'POST',
        headers: { Authorization: authorization },
        signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const texto = await resp.text();
    let data = null;
    try { data = texto ? JSON.parse(texto) : null; } catch { /* respuesta que no es JSON */ }
    return { ok: resp.ok, status: resp.status, data };
}

const comoLista = data => (Array.isArray(data) ? data : []);

// Fallas del servicio. Se responde 502/504 y nunca su código original: un 401 del servicio externo
// haría que el front cierre la sesión del operador, que no tiene nada que ver.
function responderFallaServicio(res, err, mensaje) {
    if (err && err.name === 'TimeoutError') {
        return res.status(504).json({ success: false, error: `${mensaje}: el servicio no respondió a tiempo` });
    }
    return res.status(502).json({ success: false, error: mensaje });
}

module.exports = { llamarServicio, comoLista, authBearer, authApiKey, responderFallaServicio };
