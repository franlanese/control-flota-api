const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const pool = await poolPromise;

        const result = await pool.request()
            .input('NroCliente', sql.Int, parseInt(body.nro_cliente, 10) || 0)
            .input('Nombre', sql.VarChar(150), String(body.nombre || ''))
            .input('CodCalle', sql.Int, parseInt(body.cod_calle, 10) || 0)
            .input('NombreCalle', sql.VarChar(150), String(body.nombre_calle || ''))
            .input('NroPuerta', sql.VarChar(50), String(body.nro_puerta || ''))
            .input('Ubicacion', sql.VarChar(250), String(body.ubicacion || ''))
            .input('CodLocalidad', sql.Int, parseInt(body.cod_localidad, 10) || null)
            .input('NombreLocalidad', sql.VarChar(150), String(body.localidad || ''))
            .input('Latitud', sql.Real, parseFloat(body.latitud) || 0)
            .input('Longitud', sql.Real, parseFloat(body.longitud) || 0)
            .input('CodCalle1', sql.Int, parseInt(body.cod_calle1, 10) || 0)
            .input('NombreCalle1', sql.VarChar(150), String(body.nombreCalle1 || ''))
            .input('CodCalle2', sql.Int, parseInt(body.cod_calle2, 10) || 0)
            .input('NombreCalle2', sql.VarChar(150), String(body.nombreCalle2 || ''))
            .input('Telefono', sql.VarChar(50), String(body.telefono || ''))
            .input('Alias', sql.VarChar(150), String(body.alias || ''))
            .input('Observaciones', sql.VarChar(500), String(body.observaciones || ''))
            .execute('dbo.Cliente_Modificar');

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en pedidosUpdateCliente: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno al actualizar cliente'
        });
    }
};
