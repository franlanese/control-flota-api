const { sql, poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const user = req.user || {};
        const userId = user.userId !== undefined ? parseInt(user.userId, 10) : 1;
        const importe = parseFloat(body.importe);

        if (isNaN(importe)) {
            return res.status(400).json({
                success: false,
                error: 'El parámetro importe es requerido y debe ser numérico'
            });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('Importe', sql.Real, importe)
            .input('NumeroUsuarioTelefonista', sql.Int, userId)
            .output('AVGImporteSalud', sql.Real)
            .output('AVGImporteTaxi', sql.Real)
            .execute('dbo.ViajeReCalcularImporteSalud');

        res.json({
            success: true,
            avg_importe_salud: result.output.AVGImporteSalud,
            avg_importe_taxi: result.output.AVGImporteTaxi
        });
    } catch (err) {
        console.error('Error en recalcularImporteSalud: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno al recalcular importes de salud/taxi'
        });
    }
};
