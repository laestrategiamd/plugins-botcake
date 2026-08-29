# Fase 0 — Requisitos

Antes de preguntarle nada sobre su negocio, comprueba que esta persona puede terminar.
Si falta un requisito y avanzas igual, en la Fase 7 se estrella y pierde el trabajo de
tres tandas.

Preguntaselo todo de una vez, en una sola lista, y que te conteste con si o no.

---

## Los cinco requisitos

### 1. Una cuenta de Pancake con al menos una pagina conectada

**Como lo comprueba:** entra a `pancake.vn` (o `pancake.biz`) e inicia sesion. En la lista
del panel tiene que ver el nombre de su pagina de Facebook, su cuenta de Instagram o su
numero de WhatsApp.

**Si no tiene:** para aqui. Conectar una pagina no es parte de esta skill. Diselo asi:
*"Necesitas primero conectar tu pagina de Facebook, Instagram o tu WhatsApp a Pancake. Eso
se hace desde Pancake, en Configuracion, y toma unos minutos. Cuando lo tengas, volvemos."*

**Preguntale cual canal va a usar el bot** y anotalo, porque cambia lo que se puede hacer:

| Canal | Que cambia |
|-------|------------|
| WhatsApp API | Los botones que abren un enlace o llaman por telefono **no funcionan**. Solo botones que llevan a otro paso del bot. |
| Facebook Messenger | Funciona todo. |
| Instagram | Funciona casi todo. |

### 2. Permisos de administrador en esa pagina

**Como lo comprueba:** entra a `botcake.io`, elige su pagina, y mira si puede abrir el menu
**Botcake AI**. Si le sale que no tiene permiso, no es administrador.

**Si no tiene:** el dueno de la cuenta tiene que darle permisos, o hacer el montaje el
mismo. No hay forma de saltarselo.

### 3. La billetera de Pancake conectada, con saldo

Esta es la que mas gente frena, y es la que menos se ve venir.

Desde enero de 2026 el agente de inteligencia artificial de Botcake se cobra por la
**billetera de Pancake**. Si esa pagina nunca ha usado un agente, al abrir **Botcake AI**
sale un aviso que dice **"Conectar a la billetera Pancake"** y **bloquea toda la
configuracion**: no deja escribir el prompt, ni subir archivos, ni elegir el modelo.

**Como lo comprueba:** `botcake.io` → su pagina → **Botcake AI**. Si ve las pestanas
*Instruccion*, *Herramientas*, *Conocimiento* y *Comportamiento*, esta conectada. Si ve el
aviso de conectar la billetera, no lo esta.

**Si no lo esta:** lo tiene que conectar **el dueno de la cuenta**, porque es un tema de
facturacion — se le va a cobrar el consumo del bot ahi. No lo hagas tu ni le pidas datos de
pago. Diselo asi: *"Esto lo tiene que hacer el dueno de la cuenta desde Botcake AI, porque
implica el cobro del consumo. Cuando este conectado seguimos."*

### 4. Node.js instalado

Hace falta para el navegador automatizado que monta el bot en la Fase 7.

**Como lo comprueba** (corre tu este comando):

```bash
node -v
```

Si responde algo como `v20.11.0` o superior, esta bien. Si dice `command not found`, no lo
tiene.

**Si no lo tiene:** que descargue la version LTS de `nodejs.org`, la instale con doble
clic, y **cierre y vuelva a abrir Claude Code** para que el sistema lo vea.

### 5. Una carpeta para el proyecto

Los archivos del bot (el prompt, la base de conocimiento, el diagrama) se van a guardar
donde el usuario abrio Claude Code. Comprueba donde esta:

```bash
pwd && ls
```

Si esta en una carpeta llena de cosas ajenas, sugierele crear una carpeta propia para el
bot y abrir Claude Code ahi.

---

## Como cierras la Fase 0

Cuando los cinco esten en verde, creas `mi-bot.json` a partir de `plantilla-proyecto.json`,
anotas el canal y el nombre de la pagina, y pasas a la Fase 1.

Si alguno esta en rojo, **guardas igual** lo que ya sabes en `mi-bot.json` con el requisito
que falta marcado, y le dices que vuelva cuando lo tenga. Asi al volver no empieza de cero.
