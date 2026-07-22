const { poolPromise, sql } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const nroTitular = parseInt(req.params.nro_titular);
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No se recibió ningún archivo' });
        }

        const urlCorta = `${nroTitular}/${req.file.filename}`;
        const urlCompleta = `${req.protocol}://${req.get('host')}/fotos/titulares/${urlCorta}`;

        const pool = await poolPromise;
        await pool.request()
            .input('nro_titular', sql.Int, nroTitular)
            .input('URLfoto', sql.VarChar(250), urlCompleta)
            .input('URLfoto_corta', sql.VarChar(250), urlCorta)
            .execute('CFR_Titulares_ActualizarFoto');

        res.json({ success: true, URLfoto: urlCompleta, URLfoto_corta: urlCorta });
    } catch (err) {
        console.error('Error al actualizar foto de titular:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
