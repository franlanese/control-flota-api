const { registrarErrorWeb } = require('../../utils/errorWeb');
// Los audios IVR no viven en SQL Server: son archivos que residen en el propio
// servidor IVR externo. Este endpoint hace de proxy hacia su listado HTTP
// (equivalente a AudioController@getTable en Laravel) y arma para cada
// archivo la URL absoluta de reproducción/descarga contra ese mismo servidor.

module.exports = async (req, res) => {
    try {
        const ip = process.env.CONF_IVRIP;
        const port = process.env.CONF_IVRAUDIOSPORT;

        if (!ip || !port) {
            return res.status(500).json({ success: false, error: 'CONF_IVRIP / CONF_IVRAUDIOSPORT no configurados en el .env' });
        }

        const desde = req.query.desde || '';
        const hasta = req.query.hasta || desde;

        const url = `http://${ip}:${port}/audios.php?desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`;
        const resp = await fetch(url);
        if (!resp.ok) {
            return res.status(502).json({ success: false, error: `El servidor IVR respondió ${resp.status}` });
        }
        const audios = await resp.json();

        const data = (Array.isArray(audios) ? audios : []).map(a => ({
            ...a,
            url: `http://${ip}:${port}/${a.filename || a.name}`,
        }));

        res.json({ success: true, data });
    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en proxy de audios IVR:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
