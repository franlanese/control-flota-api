const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Qué importes puede recibir el usuario (docs/decisions/0007-importes-agendados.md). Réplica de la
// query de AgendadosController@getTable (Laravel), que armaba el SELECT con o sin cada importe:
//   - importe_pactado (lo que paga el cliente): salvo que tenga WebOcultarPactado sin WebSalud.
//   - pactado_taxi (lo que cobra el móvil): salvo que tenga WebSalud sin WebOcultarPactado.
//   - El usuario "salud" ve los dos.
// Se aplica acá y no solo en el front para que el importe oculto no viaje en el JSON.
// Qué COLUMNAS se muestran es otra regla (la de la vista de Laravel) y vive en AgendadosPage.tsx.
function importesVisibles(user) {
    const permisos = Array.isArray(user?.permisos) ? user.permisos : [];
    const esSalud = String(user?.usuario || '').toLowerCase() === 'salud';
    const webSalud = permisos.includes('WebSalud');
    const ocultarPactado = permisos.includes('WebOcultarPactado');
    return {
        pactado: esSalud || webSalud || !ocultarPactado,
        movil: esSalud || ocultarPactado || !webSalud,
    };
}

module.exports = async (req, res) => {
    try {
        const nroFlota = req.user?.nro_flota ? parseInt(req.user.nro_flota) : null;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('NroFlota', sql.Int, nroFlota)
            .execute('CFR_Agendados_Lista');
        const ver = importesVisibles(req.user);
        const data = result.recordset.map(row => ({
            ...row,
            importe_pactado: ver.pactado ? row.importe_pactado : null,
            pactado_taxi: ver.movil ? row.pactado_taxi : null,
        }));
        res.json({ success: true, data });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en CFR_Agendados_Lista:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
