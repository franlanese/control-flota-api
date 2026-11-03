const { poolPromise, sql } = require('../../../db');

// Alcance por flota, igual que Laravel: los listados se filtran por las licencias de la flota del
// usuario, y Generar valida que el móvil sea de su flota. El detalle y Abonar no lo controlan,
// tampoco en Laravel (riesgo aceptado, ver docs/decisions/0004, decisión 4).
async function movilesDeLaFlota(nroFlota) {
    const pool = await poolPromise;
    const r = await pool.request().input('NroFlota', sql.SmallInt, nroFlota).execute('CFR_Moviles_PorFlota');
    return r.recordset || [];
}

async function filtrarPorFlota(req, lista) {
    const nroFlota = req.user.nro_flota;
    if (!nroFlota) return lista;
    const moviles = await movilesDeLaFlota(nroFlota);
    const licencias = new Set(moviles.map(m => m.nro_licencia).filter(Boolean));
    return lista.filter(liq => licencias.has(String(liq.Licencia ?? '').trim()));
}

async function movilEsDeSuFlota(req, idMovil) {
    const nroFlota = req.user.nro_flota;
    if (!nroFlota) return true;
    const moviles = await movilesDeLaFlota(nroFlota);
    return moviles.some(m => String(m.nro_movil) === String(idMovil).trim());
}

module.exports = { filtrarPorFlota, movilEsDeSuFlota };
