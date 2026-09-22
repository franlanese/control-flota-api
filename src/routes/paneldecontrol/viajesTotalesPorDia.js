const { poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// tipo: 'D' = por día, 'W' = por semana
module.exports = async (req, res) => {
    const tipo = req.query.tipo === 'W' ? 'W' : 'D';
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`SET NOCOUNT ON; SET DATEFORMAT dmy; EXEC Rep_ViajesTotalesxDia @Tipo='${tipo}'`);
        res.json({ success: true, data: result.recordset, tipo });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en viajesTotalesPorDia:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
