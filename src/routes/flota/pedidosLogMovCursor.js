const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const user = req.user || {};
        const userId = user.userId !== undefined ? parseInt(user.userId, 10) : 1;

        const latitudOrig = parseFloat(body.latitud_orig);
        const longitudOrig = parseFloat(body.longitud_orig);
        const latitudNueva = parseFloat(body.latitud_nueva);
        const longitudNueva = parseFloat(body.longitud_nueva);

        if (isNaN(latitudOrig) || isNaN(longitudOrig) || isNaN(latitudNueva) || isNaN(longitudNueva)) {
            return res.status(400).json({
                success: false,
                error: 'Parámetros latitud_orig, longitud_orig, latitud_nueva y longitud_nueva son requeridos y deben ser numéricos'
            });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('NroOperador', sql.Int, userId)
            .input('LatitudOrig', sql.Real, latitudOrig)
            .input('LongitudOrig', sql.Real, longitudOrig)
            .input('LatitudNueva', sql.Real, latitudNueva)
            .input('LongitudNueva', sql.Real, longitudNueva)
            .execute('dbo.NU_LogMovCursor');

        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en logMovCursor: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno al registrar movimiento del cursor'
        });
    }
};
