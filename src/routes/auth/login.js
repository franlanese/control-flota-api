const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../../../db');
const { registrarErrorWeb } = require('../../utils/errorWeb');

module.exports = async (req, res) => {
    try {
        const body = req.body || {};
        const usuarioInput = body.usuario;
        const passwordInput = body.password;
        const puestoInput = body.puesto !== undefined ? parseInt(body.puesto, 10) : 0;
        const mesasInput = Array.isArray(body.mesas) ? body.mesas : [];

        if (!usuarioInput || !passwordInput) {
            return res.status(400).json({
                success: false,
                error: 'Los parámetros usuario y password son requeridos.'
            });
        }

        const pool = await poolPromise;

        // 1. Buscar el usuario en NuUsuarios
        const userQuery = await pool.request()
            .input('Usuario', sql.VarChar(50), usuarioInput)
            .query('SELECT user_id, usuario, password, nivel, nombre, nro_flota FROM NuUsuarios WHERE usuario = @Usuario');

        if (userQuery.recordset.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Usuario o contraseña incorrectos.'
            });
        }

        const user = userQuery.recordset[0];

        // 2. Verificar la contraseña usando bcrypt
        const passwordValida = await bcrypt.compare(passwordInput, user.password);
        if (!passwordValida) {
            return res.status(401).json({
                success: false,
                error: 'Usuario o contraseña incorrectos.'
            });
        }

        // 3. Verificar Notificaciones / Bloqueos mediante NotificacionWeb SP
        let estado = '';
        let mensaje = '';
        try {
            const checkRequest = pool.request()
                .input('tipo', sql.VarChar(50), 'check')
                .input('operador', sql.Int, user.user_id)
                .output('estado', sql.VarChar(50))
                .output('mensaje', sql.VarChar(250));

            const checkResult = await checkRequest.execute('dbo.CFR_NotificacionWeb');
            estado = checkResult.output.estado;
            mensaje = checkResult.output.mensaje || '';
        } catch (notifErr) {
            console.error('Error al verificar NotificacionWeb:', notifErr);
            // Continuamos si hay problemas con las notificaciones de expiración
        }

        // Si está vencido el pago o tiene bloqueo estricto, no permitimos el login
        if (estado === 'VENCIDO') {
            return res.status(403).json({
                success: false,
                error: mensaje || 'No puede ingresar al sistema. Licencia vencida.'
            });
        }

        // 4. Formatear mesas seleccionadas (concatenación simple como en Laravel, ej: [1, 5] -> "15")
        let nroMesas = '0';
        if (mesasInput.length > 0) {
            nroMesas = mesasInput.map(m => String(m).trim()).join('');
        }

        // 5. Actualizar los datos de conexión del usuario
        const ipCliente = req.ip || req.connection.remoteAddress || '127.0.0.1';
        const versionApp = 'v3.0.0-node';

        await pool.request()
            .input('UserId', sql.Int, user.user_id)
            .input('NroPuesto', sql.Int, puestoInput)
            .input('NroMesas', sql.VarChar(50), nroMesas)
            .input('Version', sql.VarChar(50), versionApp)
            .query('UPDATE NuUsuarios SET nro_puesto = @NroPuesto, nro_mesas = @NroMesas, ultima_conexion = GETDATE(), version = @Version WHERE user_id = @UserId');

        // 6. Registrar Log de IP de acceso
        try {
            await pool.request()
                .input('NroOperador', sql.Int, user.user_id)
                .input('IP', sql.VarChar(50), ipCliente)
                .execute('dbo.NU_LogIP');
        } catch (ipErr) {
            console.error('Error al registrar IP de acceso:', ipErr);
        }

        // 7. Cargar permisos del nivel de usuario
        const permisosQuery = await pool.request()
            .input('Nivel', sql.Int, user.nivel)
            .query('SELECT IdFuncion FROM NU_PERMISOS WHERE IdNivelSeg = @Nivel');

        const permisos = permisosQuery.recordset.map(p => p.IdFuncion);

        // 8. Crear Token JWT
        const tokenPayload = {
            userId: user.user_id,
            usuario: user.usuario,
            nombre: user.nombre,
            nivel: user.nivel,
            nro_flota: user.nro_flota,
            nro_puesto: puestoInput,
            nro_mesas: nroMesas,
            permisos: permisos
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET || 'control_flota_secret_key_2026',
            { expiresIn: '12h' } // Expira en 12 horas (típico turno de despacho)
        );

        res.json({
            success: true,
            token,
            user: {
                userId: user.user_id,
                usuario: user.usuario,
                nombre: user.nombre,
                nivel: user.nivel,
                nro_flota: user.nro_flota,
                nro_puesto: puestoInput,
                nro_mesas: nroMesas,
                permisos: permisos
            },
            aviso: estado === 'AVISO' ? mensaje : null
        });

    } catch (err) {
        await registrarErrorWeb(err, req);
        console.error('Error en login: ', err);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor durante la autenticación'
        });
    }
};
