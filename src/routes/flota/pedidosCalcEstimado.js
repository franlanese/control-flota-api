const { sql, poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const queryParams = req.query.distancia !== undefined ? req.query : req.body;
        const distancia = parseFloat(queryParams.distancia) || 0;
        const user = req.user || {};
        const userId = user.userId !== undefined ? parseInt(user.userId, 10) : 0;
        const username = user.usuario || '';
        let nroFlota = user.nro_flota !== undefined && user.nro_flota !== null ? parseInt(user.nro_flota, 10) : 0;

        if (queryParams.NroFlota !== undefined && queryParams.NroFlota !== null && queryParams.NroFlota !== '') {
            nroFlota = parseInt(queryParams.NroFlota, 10);
        }

        const pool = await poolPromise;

        if (nroFlota >= 100 && nroFlota <= 200) {
            // WebSalud
            const result = await pool.request()
                .input('Distancia', sql.Real, distancia)
                .input('NumeroUsuarioTelefonista', sql.Int, userId)
                .output('AVGImporte', sql.Real)
                .output('AVGImporteSalud', sql.Real)
                .output('AVGImporteTaxi', sql.Real)
                .execute('dbo.ViajeCalcularImporteSalud3');

            const output = result.output;
            const avgImporte = output.AVGImporte || 0;
            const avgImporteSalud = output.AVGImporteSalud || 0;
            const avgImporteTaxi = output.AVGImporteTaxi || 0;

            let estimado = avgImporteSalud;
            if (String(username).toLowerCase() === 'salud') {
                estimado = avgImporteTaxi;
            }

            res.json([{
                estimado: estimado,
                estimado_salud: avgImporteSalud,
                estimado_taxi: avgImporteTaxi,
                estimado_default: avgImporte
            }]);
        } else {
            // Convencional
            const result = await pool.request()
                .input('Distancia', sql.Real, distancia)
                .output('AVGImporte', sql.Real)
                .execute('dbo.ViajeCalcularImporte');

            const output = result.output;
            const avgImporte = output.AVGImporte || 0;

            res.json([{
                estimado: avgImporte
            }]);
        }
    } catch (err) {
        console.error('Error en calcEstimado: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno al calcular importe estimado'
        });
    }
};
