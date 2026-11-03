const { poolPromise, sql } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');
const { esEntero, esDuplicado } = require('../ctacte/comun');

// Réplica de SubctaController@store (decisión 5 de docs/decisions/0004): el control del límite y
// el MAX + 1 quedan en Node, sin transacción, igual que en Laravel. Dos altas simultáneas pueden
// superar el límite o calcular el mismo número.
module.exports = async (req, res) => {
    try {
        const { nro_ctacte: ctacte, nombre, limite_saldo: limite, nro_division: division } = req.body || {};
        const nom = String(nombre ?? '').trim();
        if (!esEntero(ctacte) || Number(ctacte) === 0) {
            return res.status(400).json({ success: false, error: 'No se puede crear SubCuenta sin una Cuenta Corriente' });
        }
        if (!nom) return res.status(400).json({ success: false, error: 'El Nombre es obligatorio' });
        if (nom.length > 60) return res.status(400).json({ success: false, error: 'El Nombre no puede tener más de 60 caracteres' });
        if (!esEntero(limite)) return res.status(400).json({ success: false, error: 'El Límite de Saldo debe ser un número entero' });
        if (!esEntero(division)) return res.status(400).json({ success: false, error: 'El Número de División es obligatorio y debe ser entero' });

        const pool = await poolPromise;
        const datos = (await pool.request()
            .input('NroCtaCte', sql.Int, Number(ctacte))
            .execute('CFR_SubCta_DatosAlta')).recordset[0];

        // Con límite 0 en la cuenta padre no se controla: significa "sin límite".
        const limiteCuenta = Number(datos.limite_ctacte) || 0;
        if (limiteCuenta > 0 && Number(datos.total_limites) + Number(limite) > limiteCuenta) {
            return res.status(400).json({ success: false, error: 'Se superó el límite de la Cuenta Corriente' });
        }

        await pool.request()
            .input('accion', sql.Char(1), 'A')
            .input('nro_ctacte', sql.Int, Number(ctacte))
            .input('nro_division', sql.Int, Number(division))
            .input('nro_subcta', sql.Int, datos.proximo_subcta)
            .input('nombre', sql.VarChar(60), nom)
            .input('saldo_actual', sql.Int, 0)
            .input('limite_saldo', sql.Int, Number(limite))
            .execute('ABM_SUBCTA');
        res.json({ success: true, nro_subcta: datos.proximo_subcta });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en ABM_SUBCTA (A):', err);
        if (esDuplicado(err)) {
            return res.status(409).json({ success: false, error: 'No se pudo crear: ya existe una SubCuenta para esa Cuenta Corriente.' });
        }
        res.status(500).json({ success: false, error: 'No se pudo crear la SubCuenta' });
    }
};
