const { sql, poolPromise } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const queryParams = req.query.numero !== undefined ? req.query : req.body;
        const numero = queryParams.numero;
        if (!numero) {
            return res.status(400).json({
                success: false,
                error: 'El parámetro numero es requerido'
            });
        }

        const pool = await poolPromise;
        let recordset = [];

        if (String(numero).includes('cliente')) {
            const cleanNro = parseInt(String(numero).replace('cliente', ''), 10);
            const result = await pool.request()
                .input('NroCliente', sql.Int, cleanNro)
                .execute('dbo.NU_CLIENTEPORNROCLI');
            recordset = result.recordset;
        } else {
            const result = await pool.request()
                .input('alias', sql.VarChar(150), String(numero))
                .execute('dbo.NU_CLIENTEPORALIAS');
            recordset = result.recordset;
        }

        res.json(recordset);
    } catch (err) {
        console.error('Error en checkTel: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno al consultar teléfono o alias'
        });
    }
};
