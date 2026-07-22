const { poolPromise, sql } = require('../../../db');

module.exports = async (req, res) => {
    try {
        const nroConductor = parseInt(req.params.nro_conductor);
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No se recibió ningún archivo' });
        }

        const urlCorta = `${nroConductor}/${req.file.filename}`;
        const urlCompleta = `${req.protocol}://${req.get('host')}/fotos/conductores/${urlCorta}`;

        const pool = await poolPromise;
        await pool.request()
            .input('nro_conductor', sql.Int, nroConductor)
            .input('URLfoto', sql.VarChar(250), urlCompleta)
            .input('URLfoto_corta', sql.VarChar(250), urlCorta)
            .execute('CFR_Conductores_ActualizarFoto');

        res.json({ success: true, URLfoto: urlCompleta, URLfoto_corta: urlCorta });
    } catch (err) {
        console.error('Error al actualizar foto de conductor:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
