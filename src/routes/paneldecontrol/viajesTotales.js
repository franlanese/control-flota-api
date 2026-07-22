const { poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    const usar6Horas = process.env.CONF_6HORAS === '1';
    const spName = usar6Horas ? 'Rep_ViajesTotalesxHora' : 'Rep_ViajesTotalesxHora8';
    try {
        const pool = await poolPromise;
        // SET DATEFORMAT dmy: los SPs internos usan fechas en formato DD/MM/YYYY (Argentina).
        // Tedious puede conectar con mdy (inglés); esto corrige la conversión implícita varchar→datetime.
        const result = await pool.request().query(`SET NOCOUNT ON; SET DATEFORMAT dmy; EXEC ${spName}`);
        res.json({ success: true, data: result.recordset, usar6Horas });
    } catch (err) {
        console.error('Error en viajesTotales:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
