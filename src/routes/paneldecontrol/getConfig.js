module.exports = async (req, res) => {
    res.json({
        success: true,
        data: {
            usar6Horas: process.env.CONF_6HORAS === '1',
            ivrActivo:  process.env.CONF_IVR != null && process.env.CONF_IVR !== '0'
        }
    });
};
