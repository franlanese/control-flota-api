const { poolPromise, sql } = require('../../../db');

// "30/06/2026 14:30" → JS Date (local) para pasar a sql.DateTime
function parseArgDatetime(str) {
    if (!str || !str.trim()) return null;
    const m = str.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
    if (!m) return null;
    const [, d, mo, y, h, min] = m;
    return new Date(parseInt(y), parseInt(mo) - 1, parseInt(d), parseInt(h), parseInt(min));
}

module.exports = async (req, res) => {
    try {
        const nroConductor = parseInt(req.params.nro_conductor);
        const {
            nombre, nro_movil, nro_telefono, nro_documento, clave_conductor,
            cuil, nro_licencia, fecha_nacimiento, Sexo, pos, imei, validado,
            suspendido, observacion_suspension, fecha_desde, fecha_hasta,
        } = req.body;

        if (imei && imei.length === 15 && !nro_movil) {
            return res.status(400).json({ success: false, error: 'Si coloca IMEI debe colocar también nro de móvil' });
        }

        const pool = await poolPromise;

        // 1. Actualizar datos del conductor
        await pool.request()
            .input('nro_conductor', sql.Int, nroConductor)
            .input('nombre', sql.VarChar(50), nombre || '')
            .input('nro_movil', sql.Int, nro_movil ? parseInt(nro_movil) : null)
            .input('nro_telefono', sql.VarChar(20), nro_telefono || '')
            .input('nro_documento', sql.VarChar(20), nro_documento || '')
            .input('clave_conductor', sql.VarChar(4), clave_conductor || '')
            .input('cuil', sql.VarChar(15), cuil || '')
            .input('nro_licencia', sql.VarChar(20), nro_licencia || '')
            .input('fecha_nacimiento', sql.Date, fecha_nacimiento || null)
            .input('Sexo', sql.Char(1), Sexo || null)
            .input('pos', sql.VarChar(1), pos ? 'S' : 'N')
            .input('imei', sql.VarChar(15), imei || '')
            .input('validado', sql.VarChar(1), validado ? 'S' : 'N')
            .execute('CFR_Conductores_Update');

        // 2. Gestión de suspensión
        const fdObj = suspendido ? parseArgDatetime(fecha_desde) : null;
        const fhObj = suspendido ? parseArgDatetime(fecha_hasta) : null;

        await pool.request()
            .input('nro_conductor', sql.Int, nroConductor)
            .input('FechaDesde', sql.DateTime, fdObj)
            .input('FechaHasta', sql.DateTime, fhObj)
            .input('observaciones', sql.VarChar(100), observacion_suspension || '')
            .input('suspende', sql.Bit, suspendido ? 1 : 0)
            .input('NroOperador', sql.Int, null)
            .execute('MF_SuspencionConductores');

        res.json({ success: true });
    } catch (err) {
        console.error('Error en CFR_Conductores_Update / MF_SuspencionConductores:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
