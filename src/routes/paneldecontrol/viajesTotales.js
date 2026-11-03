const { poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    const usar6Horas = process.env.CONF_6HORAS === '1';
    const spName = usar6Horas ? 'Rep_ViajesTotalesxHora' : 'Rep_ViajesTotalesxHora8';
    try {
        const pool = await poolPromise;
        // Sin SET DATEFORMAT, como Laravel: en Viaja el SP arma la fecha como yyyy.mm.dd y con dmy
        // falla o lee otra fecha. Ver docs/decisions/0005-dateformat-panel.md.
        const result = await pool.request().execute(spName);
        res.json({ success: true, data: result.recordset, usar6Horas });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en viajesTotales:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
