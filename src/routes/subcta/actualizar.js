const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');
const { esEntero } = require('../ctacte/comun');

// Réplica de SubctaController@update. Cuenta, división y subcuenta son la clave por la que busca el
// SP, no datos a modificar: por eso van en la URL y no se pueden cambiar.
module.exports = async (req, res) => {
    try {
        const { nroCtaCte, nroDivision, nroSubcta } = req.params;
        const { nombre, limite_saldo: limite } = req.body || {};
        const nom = String(nombre ?? '').trim();
        if (![nroCtaCte, nroDivision, nroSubcta].every(esEntero)) {
            return res.status(400).json({ success: false, error: 'SubCuenta inválida' });
        }
        if (!nom) return res.status(400).json({ success: false, error: 'El Nombre es obligatorio' });
        if (nom.length > 60) return res.status(400).json({ success: false, error: 'El Nombre no puede tener más de 60 caracteres' });
        if (!esEntero(limite)) return res.status(400).json({ success: false, error: 'El Límite de Saldo debe ser un número entero' });

        const pool = await poolPromise;
        await pool.request()
            .input('accion', sql.Char(1), 'M')
            .input('nro_ctacte', sql.Int, Number(nroCtaCte))
            .input('nro_division', sql.Int, Number(nroDivision))
            .input('nro_subcta', sql.Int, Number(nroSubcta))
            .input('nombre', sql.VarChar(60), nom)
            .input('saldo_actual', sql.Int, null)
            .input('limite_saldo', sql.Int, Number(limite))
            .execute('ABM_SUBCTA');
        res.json({ success: true });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en ABM_SUBCTA (M):', err);
        res.status(500).json({ success: false, error: 'No se pudo modificar la SubCuenta' });
    }
};
