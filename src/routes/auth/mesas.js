const { poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        // Si las mesas están desactivadas en la configuración, retornamos un array vacío
        const conMesa = process.env.CONF_CONMESA !== undefined 
            ? parseInt(process.env.CONF_CONMESA, 10) 
            : 0; // Por defecto desactivado (0) para coincidir con la configuración de Laravel

        if (conMesa === 0) {
            return res.json({
                success: true,
                data: []
            });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT NroMesa FROM MESAS GROUP BY NroMesa ORDER BY NroMesa ASC');

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error en getMesas: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener la lista de mesas'
        });
    }
};
