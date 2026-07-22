const { poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT id_puesto, descripcion, telefono FROM NU_PUESTOS ORDER BY id_puesto ASC');

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error en getPuestos: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener la lista de puestos'
        });
    }
};
