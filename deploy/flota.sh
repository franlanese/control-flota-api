#!/usr/bin/env bash
# Deploy de Control Flota en el VPS: releases + symlink "current" + healthcheck + rollback automático.
# Vive en /srv/control-flota/bin/flota.sh (lo actualiza el pipeline de la API en cada deploy).
# Corre como el usuario deploy, sin sudo.
#
#   flota.sh activar  <api|front> <staging|prod> <RID>  activa releases/<RID> (ya subido por el pipeline)
#   flota.sh probar   api <staging|prod> <RID>          sólo la prueba previa en puerto temporal
#   flota.sh promover <api|front>                       copia el release activo de staging a prod y lo activa
#   flota.sh rollback <api|front> <staging|prod>        vuelve al release activo anterior
#   flota.sh estado                                     qué release está activo en cada lugar
#
# Cómo se activa un release de la API (ver docs/decisions/0012-pipeline-ci-cd.md):
#   1. Se enlazan .env y public/fotos a shared/ (son del entorno, no del release).
#   2. Se levanta el release en un puerto temporal y se le pega a /health. Si falla, no se tocó nada.
#   3. Se mueve el symlink current (atómico) y se reinicia el proceso de pm2.
#   4. Se vuelve a pegar a /health en el puerto real. Si falla: symlink al release anterior + reinicio.
set -euo pipefail

BASE=/srv/control-flota
# pm2 hereda la carpeta actual: si no es accesible para deploy, no puede levantar su daemon (EACCES).
cd "$BASE"

die() { echo "ERROR: $*" >&2; exit 1; }
log() { echo "[$(date +%H:%M:%S)] $*"; }

conf() { # $1=app $2=entorno -> DIR, PUERTO, PUERTO_PRUEBA, PM2_NAME
    APP=$1; ENTORNO=$2
    case "$APP-$ENTORNO" in
        api-staging)   PUERTO=7400; PUERTO_PRUEBA=7410; PM2_NAME=flota-api-staging ;;
        api-prod)      PUERTO=7401; PUERTO_PRUEBA=7411; PM2_NAME=flota-api-prod ;;
        front-staging) PUERTO=8010 ;;
        front-prod)    PUERTO=1000 ;;
        *) die "combinación inválida: '$APP' '$ENTORNO' (app: api|front, entorno: staging|prod)" ;;
    esac
    DIR=$BASE/$APP/$ENTORNO
    [[ -d "$DIR/releases" ]] || die "no existe $DIR/releases"
}

validar_rid() { [[ "$1" =~ ^[A-Za-z0-9._-]+$ ]] || die "RID inválido: '$1'"; }

bloquear() { # un solo deploy a la vez por app+entorno
    exec 9>"$DIR/.lock"
    flock -n 9 || die "ya hay otro deploy corriendo sobre $APP/$ENTORNO"
}

release_activo() { [[ -L "$DIR/current" ]] && basename "$(readlink "$DIR/current")" || true; }

apuntar() { # mueve current -> releases/$1 de forma atómica (rename), nunca queda a medio cambiar
    ln -sfn "releases/$1" "$DIR/current.tmp"
    mv -Tf "$DIR/current.tmp" "$DIR/current"
}

esperar_api() { # $1=puerto $2=revision esperada $3=segundos
    local fin=$((SECONDS + $3)) r=""
    # Los releases "inicial-*" son el código que corría antes de la migración y no tienen /health:
    # para ellos alcanza con que el proceso conteste HTTP (cualquier código, ej. el 404 de Express).
    if [[ "$2" == inicial-* ]]; then
        while (( SECONDS < fin )); do
            r=$(curl -s -o /dev/null -w '%{http_code}' --max-time 4 "http://127.0.0.1:$1/health" 2>/dev/null || true)
            [[ -n "$r" && "$r" != 000 ]] && return 0
            sleep 1
        done
        log "el release $2 no contesta HTTP en :$1"
        return 1
    fi
    while (( SECONDS < fin )); do
        r=$(curl -fsS --max-time 4 "http://127.0.0.1:$1/health" 2>/dev/null || true)
        if [[ "$r" == *'"status":"ok"'* && "$r" == *"\"revision\":\"$2\""* ]]; then return 0; fi
        sleep 1
    done
    log "healthcheck falló en :$1 (esperaba revision $2; última respuesta: ${r:-sin respuesta})"
    return 1
}

esperar_front() { # $1=puerto $2=version esperada $3=segundos
    local fin=$((SECONDS + $3)) v=""
    while (( SECONDS < fin )); do
        v=$(curl -fsS --max-time 4 "http://127.0.0.1:$1/version.txt" 2>/dev/null || true)
        if [[ "$v" == "$2" ]] && curl -fsS --max-time 4 -o /dev/null "http://127.0.0.1:$1/"; then return 0; fi
        sleep 1
    done
    log "healthcheck falló en :$1 (esperaba version.txt=$2; recibí: ${v:-nada})"
    return 1
}

enlazar_compartidos() { # .env y fotos son del entorno: el release sólo los apunta
    [[ -f "$DIR/shared/.env" ]] || die "falta $DIR/shared/.env"
    mkdir -p "$DIR/shared/fotos" "$REL/public"
    if [[ -e "$REL/public/fotos" && ! -L "$REL/public/fotos" ]]; then
        die "el release trae una carpeta public/fotos real; las fotos tienen que vivir sólo en shared/"
    fi
    ln -sfn "$DIR/shared/.env" "$REL/.env"
    ln -sfn "$DIR/shared/fotos" "$REL/public/fotos"
}

probar_api() { # levanta el release en un puerto temporal, sin tráfico real
    log "Prueba previa de $RID en el puerto temporal $PUERTO_PRUEBA (los usuarios siguen en la versión actual)"
    ( cd "$REL" && PORT=$PUERTO_PRUEBA exec node index.js >"$REL/.prueba.log" 2>&1 ) &
    local pid=$! fallo=0
    esperar_api "$PUERTO_PRUEBA" "$RID" 30 || fallo=1
    kill "$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
    if (( fallo )); then
        echo "--- últimas líneas del log de la prueba ---" >&2
        tail -n 30 "$REL/.prueba.log" >&2 || true
        return 1
    fi
    log "Prueba previa OK"
}

reiniciar_api() {
    if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
        pm2 restart "$PM2_NAME" --update-env >/dev/null
    else
        pm2 start "$DIR/current/index.js" --name "$PM2_NAME" --cwd "$DIR/current" >/dev/null
    fi
}

verificar() { # $1=revision esperada
    if [[ $APP == api ]]; then esperar_api "$PUERTO" "$1" 40; else esperar_front "$PUERTO" "$1" 15; fi
}

volver_a() { # $1=release al que volver
    apuntar "$1"
    [[ $APP == api ]] && reiniciar_api
    if verificar "$1"; then
        log "Rollback a $1 OK"
    else
        log "ATENCIÓN: después del rollback, $1 tampoco responde. Revisar a mano: pm2 logs $PM2_NAME"
    fi
}

activar() { # $1=app $2=entorno $3=RID
    conf "$1" "$2"; RID=$3; validar_rid "$RID"; bloquear
    REL=$DIR/releases/$RID
    [[ -d "$REL" ]] || die "no existe $REL"
    local anterior; anterior=$(release_activo)
    if [[ "$anterior" == "$RID" ]]; then log "$RID ya está activo en $APP/$ENTORNO"; return 0; fi

    if [[ $APP == api ]]; then
        enlazar_compartidos
        probar_api || die "la prueba previa falló: $APP/$ENTORNO sigue en ${anterior:-(nada)}, no se tocó"
    else
        [[ -f "$REL/index.html" ]] || die "$REL no tiene index.html"
        [[ "$(cat "$REL/version.txt" 2>/dev/null)" == "$RID" ]] || die "$REL/version.txt no coincide con $RID"
    fi

    log "Activando $RID en $APP/$ENTORNO (antes: ${anterior:-nada})"
    apuntar "$RID"
    [[ $APP == api ]] && reiniciar_api

    if ! verificar "$RID"; then
        if [[ -n "$anterior" ]]; then
            log "Falló el healthcheck: rollback automático a $anterior"
            volver_a "$anterior"
        fi
        die "el deploy de $RID en $APP/$ENTORNO falló (activo ahora: $(release_activo))"
    fi

    echo "$RID" >> "$DIR/shared/historial"
    [[ $APP == api ]] && pm2 save >/dev/null
    log "OK: $APP/$ENTORNO ahora corre $RID"
}

promover() { # $1=app
    conf "$1" staging
    local rid; rid=$(release_activo)
    [[ -n "$rid" ]] || die "staging no tiene release activo"
    local origen=$DIR/releases/$rid
    conf "$1" prod
    if [[ ! -d "$DIR/releases/$rid" ]]; then
        log "Copiando el release $rid de staging a prod (mismo artefacto, byte a byte)"
        cp -a "$origen" "$DIR/releases/$rid"
        rm -f "$DIR/releases/$rid/.prueba.log"
    fi
    # Los links .env/fotos copiados apuntan a shared/ de staging: activar los re-apunta a los de prod.
    activar "$1" prod "$rid"
}

rollback() { # $1=app $2=entorno
    conf "$1" "$2"; bloquear
    local actual anterior
    actual=$(release_activo)
    anterior=$(grep -vxF "$actual" "$DIR/shared/historial" 2>/dev/null | tail -n 1 || true)
    [[ -n "$anterior" && -d "$DIR/releases/$anterior" ]] || die "no hay un release anterior al que volver"
    log "Rollback manual de $APP/$ENTORNO: $actual -> $anterior"
    volver_a "$anterior"
    echo "$anterior" >> "$DIR/shared/historial"
}

estado() {
    local app entorno
    for app in api front; do
        for entorno in staging prod; do
            local d=$BASE/$app/$entorno
            printf '%-6s %-8s %s\n' "$app" "$entorno" "$([[ -L $d/current ]] && basename "$(readlink "$d/current")" || echo '(sin release)')"
        done
    done
    pm2 ls 2>/dev/null || true
}

case "${1:-}" in
    activar)  [[ $# -eq 4 ]] || die "uso: flota.sh activar <api|front> <staging|prod> <RID>"; activar "$2" "$3" "$4" ;;
    probar)   [[ $# -eq 4 && $2 == api ]] || die "uso: flota.sh probar api <staging|prod> <RID>"
              conf api "$3"; RID=$4; validar_rid "$RID"; REL=$DIR/releases/$RID
              [[ -d "$REL" ]] || die "no existe $REL"; enlazar_compartidos; probar_api ;;
    promover) [[ $# -eq 2 ]] || die "uso: flota.sh promover <api|front>"; promover "$2" ;;
    rollback) [[ $# -eq 3 ]] || die "uso: flota.sh rollback <api|front> <staging|prod>"; rollback "$2" "$3" ;;
    estado)   estado ;;
    *) sed -n '2,10p' "$0"; exit 1 ;;
esac
