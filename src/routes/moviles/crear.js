const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const {
            nro_movil, canal, nro_titular, modelo, version, nro_patente, nro_licencia,
            IMEI, IMEI_AVL, Reporta, Reloj, idBT, Extra,
            Aire, Baul, Grande, Pos, Vale, Mascota, Distancia, Otro,
        } = req.body;

        if (!nro_movil || !canal) {
            return res.status(400).json({ success: false, error: 'nro_movil y canal son obligatorios' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('IdMovil',      sql.Int,        parseInt(nro_movil))
            .input('Canal',        sql.Int,        parseInt(canal))
            .input('NroTitular',   sql.Int,        parseInt(nro_titular) || 1)
            .input('Modelo',       sql.VarChar(40), modelo || '')
            .input('Version',      sql.VarChar(30), version || '')
            .input('Patente',      sql.VarChar(18), nro_patente || '')
            .input('nro_licencia', sql.VarChar(18), nro_licencia || '')
            .input('imei',         sql.VarChar(15), IMEI || '')
            .input('Imei_avl',     sql.VarChar(50), IMEI_AVL || '')
            .input('Habilitado',   sql.VarChar(1),  'H')
            .input('Reporta',      sql.VarChar(5),  Reporta || 'no')
            .input('Aire',         sql.Int,         Aire ? 1 : 0)
            .input('Baul',         sql.Int,         Baul ? 1 : 0)
            .input('Grande',       sql.Int,         Grande ? 1 : 0)
            .input('Pos',          sql.Int,         Pos ? 1 : 0)
            .input('Vale',         sql.Int,         Vale ? 1 : 0)
            .input('Mascota',      sql.Int,         Mascota ? 1 : 0)
            .input('Distancia',    sql.Int,         Distancia ? 1 : 0)
            .input('Otro',         sql.Int,         Otro ? 1 : 0)
            .input('Reloj',        sql.VarChar(20), Reloj || 'no')
            .input('IdBT',         sql.VarChar(50), idBT || '')
            .input('Extra',        sql.VarChar(200), Extra || '')
            .execute('Movil_Crear');

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en Movil_Crear:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
