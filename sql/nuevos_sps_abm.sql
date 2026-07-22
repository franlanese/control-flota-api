/* =====================================================================
   Nuevos Stored Procedures para los ABMs: Conductores, Titulares,
   Reporte AVL, Agendados, Usuarios, Niveles, Puestos.

   Convención: todos los SPs nuevos usan el prefijo CFR_ (Control Flota
   React) para no chocar con los SPs de negocio existentes (NU_*, MF_*),
   que se reutilizan sin modificar (MF_SuspencionConductores,
   NU_ViajeAgendado_Crear1/Crear3/Anular/BorrarItem).

   Ejecutar este script una sola vez contra la base de datos antes de
   usar los nuevos endpoints de control-flota-api.
   ===================================================================== */

USE [Demo];
GO

-- =====================================================================
-- CONDUCTORES
-- =====================================================================

IF OBJECT_ID('dbo.CFR_Conductores_Lista') IS NOT NULL DROP PROCEDURE dbo.CFR_Conductores_Lista;
GO
CREATE PROCEDURE dbo.CFR_Conductores_Lista
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        nro_conductor, nombre, nro_movil, telefono AS nro_telefono, nro_documento,
        clave_conductor, cuil, nro_licencia, fecha_nacimiento, Sexo, POS, validado, imei,
        URLfoto, URLfoto_corta,
        suspendido, observacion_suspension, fecha_desde_suspension, fecha_hasta_suspension
    FROM CONDUCTORES
    WHERE nro_conductor <> 0
    ORDER BY nro_conductor;
END
GO

IF OBJECT_ID('dbo.CFR_Conductores_Crear') IS NOT NULL DROP PROCEDURE dbo.CFR_Conductores_Crear;
GO
CREATE PROCEDURE dbo.CFR_Conductores_Crear
    @nro_conductor    INT,
    @nombre           VARCHAR(50)  = NULL,
    @nro_movil        INT          = NULL,
    @nro_telefono     VARCHAR(20)  = NULL,
    @nro_documento    VARCHAR(20)  = NULL,
    @clave_conductor  VARCHAR(4)   = NULL,
    @cuil             VARCHAR(15)  = NULL,
    @nro_licencia     VARCHAR(20)  = NULL,
    @fecha_nacimiento DATE         = NULL,
    @Sexo             CHAR(1)      = NULL,
    @pos              VARCHAR(1)   = 'N',
    @imei             VARCHAR(15)  = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM CONDUCTORES WHERE nro_conductor = @nro_conductor)
    BEGIN
        RAISERROR('Ya existe un conductor con ese numero', 16, 1);
        RETURN;
    END

    INSERT INTO CONDUCTORES
        (nro_conductor, nombre, nro_movil, telefono, nro_documento, clave_conductor,
         cuil, nro_licencia, fecha_nacimiento, Sexo, POS, imei, validado, suspendido)
    VALUES
        (@nro_conductor, ISNULL(@nombre, 'Sin nombre'), NULLIF(@nro_movil, 0), @nro_telefono,
         @nro_documento, @clave_conductor, @cuil, @nro_licencia, @fecha_nacimiento,
         @Sexo, @pos, @imei, 'N', 0);
END
GO

IF OBJECT_ID('dbo.CFR_Conductores_Update') IS NOT NULL DROP PROCEDURE dbo.CFR_Conductores_Update;
GO
CREATE PROCEDURE dbo.CFR_Conductores_Update
    @nro_conductor    INT,
    @nombre           VARCHAR(50)  = NULL,
    @nro_movil        INT          = NULL,
    @nro_telefono     VARCHAR(20)  = NULL,
    @nro_documento    VARCHAR(20)  = NULL,
    @clave_conductor  VARCHAR(4)   = NULL,
    @cuil             VARCHAR(15)  = NULL,
    @nro_licencia     VARCHAR(20)  = NULL,
    @fecha_nacimiento DATE         = NULL,
    @Sexo             CHAR(1)      = NULL,
    @pos              VARCHAR(1)   = 'N',
    @imei             VARCHAR(15)  = NULL,
    @validado         VARCHAR(1)   = 'N'
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE CONDUCTORES
    SET nombre           = ISNULL(@nombre, 'Sin nombre'),
        nro_movil        = NULLIF(@nro_movil, 0),
        telefono         = @nro_telefono,
        nro_documento    = @nro_documento,
        clave_conductor  = @clave_conductor,
        cuil             = @cuil,
        nro_licencia     = @nro_licencia,
        fecha_nacimiento = @fecha_nacimiento,
        Sexo             = @Sexo,
        POS              = @pos,
        imei             = @imei,
        validado         = @validado
    WHERE nro_conductor = @nro_conductor;
END
GO

IF OBJECT_ID('dbo.CFR_Conductores_Delete') IS NOT NULL DROP PROCEDURE dbo.CFR_Conductores_Delete;
GO
CREATE PROCEDURE dbo.CFR_Conductores_Delete
    @nro_conductor INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM CONDUCTORES WHERE nro_conductor = @nro_conductor;
END
GO

IF OBJECT_ID('dbo.CFR_Conductores_ActualizarFoto') IS NOT NULL DROP PROCEDURE dbo.CFR_Conductores_ActualizarFoto;
GO
CREATE PROCEDURE dbo.CFR_Conductores_ActualizarFoto
    @nro_conductor  INT,
    @URLfoto        VARCHAR(250) = NULL,
    @URLfoto_corta  VARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE CONDUCTORES
    SET URLfoto = @URLfoto, URLfoto_corta = @URLfoto_corta
    WHERE nro_conductor = @nro_conductor;
END
GO


-- =====================================================================
-- TITULARES
-- =====================================================================

IF OBJECT_ID('dbo.CFR_Titulares_Lista') IS NOT NULL DROP PROCEDURE dbo.CFR_Titulares_Lista;
GO
CREATE PROCEDURE dbo.CFR_Titulares_Lista
AS
BEGIN
    SET NOCOUNT ON;
    SELECT nro_titular, nombre, nro_documento, nro_telefono, nro_cuit, email, URLfoto, URLfoto_corta
    FROM TITULARES
    ORDER BY nro_titular;
END
GO

IF OBJECT_ID('dbo.CFR_Titulares_Crear') IS NOT NULL DROP PROCEDURE dbo.CFR_Titulares_Crear;
GO
CREATE PROCEDURE dbo.CFR_Titulares_Crear
    @nro_titular   INT,
    @nombre        VARCHAR(40) = NULL,
    @nro_documento VARCHAR(20) = NULL,
    @nro_telefono  VARCHAR(20) = NULL,
    @nro_cuit      VARCHAR(15) = NULL,
    @email         VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM TITULARES WHERE nro_titular = @nro_titular)
    BEGIN
        RAISERROR('Ya existe un titular con ese numero', 16, 1);
        RETURN;
    END

    INSERT INTO TITULARES (nro_titular, nombre, nro_documento, nro_telefono, nro_cuit, email)
    VALUES (@nro_titular, @nombre, @nro_documento, @nro_telefono, @nro_cuit, @email);
END
GO

IF OBJECT_ID('dbo.CFR_Titulares_Update') IS NOT NULL DROP PROCEDURE dbo.CFR_Titulares_Update;
GO
CREATE PROCEDURE dbo.CFR_Titulares_Update
    @nro_titular   INT,
    @nombre        VARCHAR(40) = NULL,
    @nro_documento VARCHAR(20) = NULL,
    @nro_telefono  VARCHAR(20) = NULL,
    @nro_cuit      VARCHAR(15) = NULL,
    @email         VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE TITULARES
    SET nombre = @nombre, nro_documento = @nro_documento, nro_telefono = @nro_telefono,
        nro_cuit = @nro_cuit, email = @email
    WHERE nro_titular = @nro_titular;
END
GO

IF OBJECT_ID('dbo.CFR_Titulares_Delete') IS NOT NULL DROP PROCEDURE dbo.CFR_Titulares_Delete;
GO
CREATE PROCEDURE dbo.CFR_Titulares_Delete
    @nro_titular INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM TITULARES WHERE nro_titular = @nro_titular;
END
GO

IF OBJECT_ID('dbo.CFR_Titulares_ActualizarFoto') IS NOT NULL DROP PROCEDURE dbo.CFR_Titulares_ActualizarFoto;
GO
CREATE PROCEDURE dbo.CFR_Titulares_ActualizarFoto
    @nro_titular   INT,
    @URLfoto       VARCHAR(250) = NULL,
    @URLfoto_corta VARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE TITULARES
    SET URLfoto = @URLfoto, URLfoto_corta = @URLfoto_corta
    WHERE nro_titular = @nro_titular;
END
GO


-- =====================================================================
-- REPORTE AVL (solo lectura)
-- =====================================================================

IF OBJECT_ID('dbo.CFR_ReporteAVL_Lista') IS NOT NULL DROP PROCEDURE dbo.CFR_ReporteAVL_Lista;
GO
CREATE PROCEDURE dbo.CFR_ReporteAVL_Lista
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        nro_movil, nro_licencia, idAVL, Latitud_AVL, Longitud_AVL, Velocidad_AVL,
        FechaUltimoContacto_AVL, GETDATE() AS ahora,
        CASE
            WHEN DATEDIFF(MINUTE, FechaUltimoContacto_AVL, GETDATE()) < 30  THEN 'verde'
            WHEN DATEDIFF(MINUTE, FechaUltimoContacto_AVL, GETDATE()) < 120 THEN 'amarillo'
            ELSE 'rojo'
        END AS estado_comunicacion
    FROM MOVILES
    WHERE idAVL IS NOT NULL
    ORDER BY FechaUltimoContacto_AVL DESC;
END
GO


-- =====================================================================
-- AGENDADOS (solo el listado; alta/edición/anulación reutilizan
-- NU_ViajeAgendado_Crear1 / Crear3 / Anular / BorrarItem existentes)
-- =====================================================================

IF OBJECT_ID('dbo.CFR_Agendados_Lista') IS NOT NULL DROP PROCEDURE dbo.CFR_Agendados_Lista;
GO
CREATE PROCEDURE dbo.CFR_Agendados_Lista
    @NroFlota INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        VA.nro_viaje_agendado, VA.hora_viaje,
        CONVERT(VARCHAR(8), VA.hora_viaje, 108) AS hora_viaje_format,
        VA.direccion, VA.importe_pactado, VA.pactado_taxi,
        VA.CalleDestino, VA.NroDestino, VA.LatitudDestino, VA.LongitudDestino,
        VA.DuracionEstimada, VA.KmEstimados,
        VA.nombre_calle, VA.cod_calle, VA.numero, VA.cod_zona,
        VA.fec_ini_vigencia, VA.fec_fin_vigencia,
        CONVERT(VARCHAR(10), VA.fec_ini_vigencia, 103) AS fecha_ini_format,
        CONVERT(VARCHAR(10), VA.fec_fin_vigencia, 103) AS fecha_fin_format,
        VA.nombre_calle1, VA.cod_calle1, VA.nombre_calle2, VA.cod_calle2,
        VA.ind_lunes, VA.ind_martes, VA.ind_miercoles, VA.ind_jueves, VA.ind_viernes, VA.ind_sabado, VA.ind_domingo,
        VA.opcion_agenda, VA.latitud, VA.longitud,
        LEFT(CONVERT(VARCHAR, VA.nro_telefono * 100), LEN(VA.nro_telefono) - 3) AS nro_telefono,
        VA.ubicacion, VA.nombre, VA.comentario, VA.localidad, VA.cod_localidad,
        VA.observaciones, VA.cant_moviles, VA.nro_cliente, VA.categ_movil,
        VA.nro_flota_original, VA.IdaVuelta, VA.nro_ctacte, VA.nro_subcta,
        (SELECT TOP 1 CT.FormaPago FROM CTACTE CT WHERE CT.nro_ctacte = VA.nro_ctacte) AS forma_pago
    FROM viajes_agendados AS VA
    WHERE VA.fec_fin_vigencia > DATEADD(DAY, -1, GETDATE())
      AND (@NroFlota IS NULL OR @NroFlota = 0 OR VA.nro_flota_original = @NroFlota)
    ORDER BY VA.nro_viaje_agendado;
END
GO


-- =====================================================================
-- USUARIOS
-- =====================================================================

IF OBJECT_ID('dbo.CFR_Usuarios_Lista') IS NOT NULL DROP PROCEDURE dbo.CFR_Usuarios_Lista;
GO
CREATE PROCEDURE dbo.CFR_Usuarios_Lista
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        U.user_id, U.usuario, U.nombre, U.nivel, NS.Descripcion AS niveldesc,
        U.nro_puesto, NP.descripcion AS puesto_desc, NP.telefono AS puesto_tel,
        U.version, U.ultima_conexion
    FROM NuUsuarios U
    LEFT JOIN NIVELSEG NS ON NS.IdNivelSeg = U.nivel
    LEFT JOIN NU_PUESTOS NP ON NP.id_puesto = U.nro_puesto
    WHERE U.nivel <> 3
    ORDER BY U.user_id;
END
GO

IF OBJECT_ID('dbo.CFR_Usuarios_Crear') IS NOT NULL DROP PROCEDURE dbo.CFR_Usuarios_Crear;
GO
CREATE PROCEDURE dbo.CFR_Usuarios_Crear
    @usuario    VARCHAR(50),
    @nombre     VARCHAR(50),
    @password   VARCHAR(255),
    @nivel      INT,
    @nro_puesto INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO NuUsuarios (usuario, nombre, password, nivel, nro_puesto)
    VALUES (@usuario, @nombre, @password, @nivel, @nro_puesto);
END
GO

IF OBJECT_ID('dbo.CFR_Usuarios_Update') IS NOT NULL DROP PROCEDURE dbo.CFR_Usuarios_Update;
GO
CREATE PROCEDURE dbo.CFR_Usuarios_Update
    @user_id    INT,
    @usuario    VARCHAR(50),
    @nombre     VARCHAR(50),
    @password   VARCHAR(255) = NULL,
    @nivel      INT,
    @nro_puesto INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE NuUsuarios
    SET usuario    = @usuario,
        nombre     = @nombre,
        nivel      = @nivel,
        nro_puesto = @nro_puesto,
        password   = COALESCE(@password, password)
    WHERE user_id = @user_id;
END
GO

IF OBJECT_ID('dbo.CFR_Usuarios_Delete') IS NOT NULL DROP PROCEDURE dbo.CFR_Usuarios_Delete;
GO
CREATE PROCEDURE dbo.CFR_Usuarios_Delete
    @user_id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM NuUsuarios WHERE user_id = @user_id;
END
GO

IF OBJECT_ID('dbo.CFR_Niveles_Lista') IS NOT NULL DROP PROCEDURE dbo.CFR_Niveles_Lista;
GO
CREATE PROCEDURE dbo.CFR_Niveles_Lista
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdNivelSeg, Descripcion
    FROM NIVELSEG
    WHERE IdNivelSeg <> 3
    ORDER BY Descripcion;
END
GO


-- =====================================================================
-- PUESTOS
-- =====================================================================

IF OBJECT_ID('dbo.CFR_Puestos_Lista') IS NOT NULL DROP PROCEDURE dbo.CFR_Puestos_Lista;
GO
CREATE PROCEDURE dbo.CFR_Puestos_Lista
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id_puesto, descripcion, telefono
    FROM NU_PUESTOS
    WHERE id_puesto <> 0
    ORDER BY id_puesto;
END
GO

IF OBJECT_ID('dbo.CFR_Puestos_Crear') IS NOT NULL DROP PROCEDURE dbo.CFR_Puestos_Crear;
GO
CREATE PROCEDURE dbo.CFR_Puestos_Crear
    @descripcion VARCHAR(100),
    @telefono    VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO NU_PUESTOS (descripcion, telefono)
    VALUES (@descripcion, @telefono);

    SELECT SCOPE_IDENTITY() AS id_puesto;
END
GO

IF OBJECT_ID('dbo.CFR_Puestos_Update') IS NOT NULL DROP PROCEDURE dbo.CFR_Puestos_Update;
GO
CREATE PROCEDURE dbo.CFR_Puestos_Update
    @id_puesto   INT,
    @descripcion VARCHAR(100),
    @telefono    VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE NU_PUESTOS
    SET descripcion = @descripcion, telefono = @telefono
    WHERE id_puesto = @id_puesto;
END
GO

IF OBJECT_ID('dbo.CFR_Puestos_Delete') IS NOT NULL DROP PROCEDURE dbo.CFR_Puestos_Delete;
GO
CREATE PROCEDURE dbo.CFR_Puestos_Delete
    @id_puesto INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM NU_PUESTOS WHERE id_puesto = @id_puesto;
END
GO
