const { poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

// Réplica de MensajeriaController@getUsuarios (Laravel, raw SQL) — lista de usuarios para el
// autocomplete de destinatarios + lista de grupos para el combo "Grupos" del compositor de
// mensajes. Ver CFR_Mensajeria_Usuarios (nuevo).
module.exports = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('dbo.CFR_Mensajeria_Usuarios');

        res.json({
            success: true,
            data: {
                usuarios: result.recordsets[0],
                grupos: result.recordsets[1]
            }
        });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en mensajeria/usuarios: ', err);
        res.status(500).json({ success: false, error: 'Error interno del servidor al obtener usuarios/grupos' });
    }
};
