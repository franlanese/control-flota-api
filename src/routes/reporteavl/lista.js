const { poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SET NOCOUNT ON; EXEC CFR_ReporteAVL_Lista');
        // Según la instalación, el SP devuelve la columna como "Reporta" o "reporta" (la de
        // Viaja la trae en minúscula). El front lee r.Reporta: se normaliza acá.
        const data = result.recordset.map(({ reporta, ...r }) => ({
            ...r,
            Reporta: r.Reporta ?? reporta ?? null,
        }));
        res.json({ success: true, data });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en CFR_ReporteAVL_Lista:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
