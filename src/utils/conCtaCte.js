// Réplica de config('configuracion.CONCTACTE') != 0. Sin la variable queda apagado, como en PHP
// (null != 0 es false). Se lee del .env al arrancar: para cambiarlo hay que reiniciar el API.
const conCtaCte = () => Number(process.env.CONF_CONCTACTE || 0) !== 0;

module.exports = { conCtaCte };
