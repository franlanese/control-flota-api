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
        const nroMovil = parseInt(req.params.nro_movil);
        const {
            modelo, version, nro_patente, nro_licencia,
            IMEI, IMEI_AVL, canal, nro_titular, Reporta,
            Reloj, idBT, Extra, EMPRESA, fec_fin_poliza_seguro,
            Aire, Baul, Grande, Pos, Vale, Mascota, Distancia, Otro,
            suspendido, observacion_suspension, fecha_desde, fecha_hasta,
        } = req.body;

        const pool = await poolPromise;

        // 1. Actualizar datos del móvil
        await pool.request()
            .input('nro_movil',      sql.Int,          nroMovil)
            .input('modelo',         sql.VarChar(40),   modelo || '')
            .input('version',        sql.VarChar(30),   version || '')
            .input('nro_patente',    sql.VarChar(18),   nro_patente || '')
            .input('nro_licencia',   sql.VarChar(18),   nro_licencia || '')
            .input('IMEI',           sql.VarChar(15),   IMEI || '')
            .input('IMEI_AVL',       sql.VarChar(50),   IMEI_AVL || '')
            .input('nro_canal',      sql.Int,           parseInt(canal) || 0)
            .input('nro_titular',    sql.Int,           parseInt(nro_titular) || 1)
            .input('Reporta',        sql.VarChar(5),    Reporta || 'no')
            .input('Reloj',          sql.VarChar(20),   Reloj || 'no')
            .input('idBT',           sql.VarChar(50),   idBT || '')
            .input('Extra',          sql.VarChar(200),  Extra || '')
            .input('EMPRESA',        sql.VarChar(200),  EMPRESA || '')
            .input('fec_fin_poliza', sql.VarChar(10),   fec_fin_poliza_seguro || '')
            .input('Aire',           sql.VarChar(5),    Aire ? 'True' : 'False')
            .input('Baul',           sql.VarChar(5),    Baul ? 'True' : 'False')
            .input('Grande',         sql.VarChar(5),    Grande ? 'True' : 'False')
            .input('Pos',            sql.VarChar(5),    Pos ? 'True' : 'False')
            .input('Vale',           sql.VarChar(5),    Vale ? 'True' : 'False')
            .input('Mascota',        sql.VarChar(5),    Mascota ? 'True' : 'False')
            .input('Distancia',      sql.VarChar(5),    Distancia ? 'True' : 'False')
            .input('Otro',           sql.VarChar(5),    Otro ? 'True' : 'False')
            .execute('CFR_Moviles_Update');

        // 2. Gestión de suspensión
        const fdObj = suspendido ? parseArgDatetime(fecha_desde) : null;
        const fhObj = suspendido ? parseArgDatetime(fecha_hasta) : null;

        await pool.request()
            .input('nro_movil',    sql.Int,          nroMovil)
            .input('FechaDesde',   sql.DateTime,     fdObj)
            .input('FechaHasta',   sql.DateTime,     fhObj)
            .input('observaciones',sql.VarChar(100), observacion_suspension || '')
            .input('suspende',     sql.Bit,          suspendido ? 1 : 0)
            .input('NroOperador',  sql.Int,          null)
            .execute('CFR_MF_SuspencionMoviles');

        res.json({ success: true });
    } catch (err) {
        console.error('Error en CFR_Moviles_Update / MF_SuspencionMoviles:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
