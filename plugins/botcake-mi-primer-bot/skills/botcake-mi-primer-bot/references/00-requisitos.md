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

**Si no tiene:** no avances a la Fase 1, pero ofrecele acompanarlo ahora mismo. Diselo asi:
*"Te falta la cuenta (o conectar tu pagina). Si quieres, te acompano a crearla ya: yo te voy
diciendo donde hacer clic y tu lo haces todo desde tu navegador."* Si acepta, abre
`00b-arranque-desde-cero.md` y siguela. Si prefiere hacerlo solo, dile que vuelva cuando
la tenga.

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

**Y el saldo.** Conectada no quiere decir con saldo. En Botcake > **Configuracion >
Facturacion** (la direccion termina en `/settings/billing`) sale la cuenta prepago con una
linea **BOTCAKE AI**. Si esta en cero, el bot no contesta y la base de conocimiento no se
indexa, sin ningun aviso. Si esta en cero o casi, que recargue antes de seguir. La recarga
automatica existe, pero no siempre salta: hay que mirarla cada semana.

**Si no lo esta:** lo tiene que conectar **el dueno de la cuenta**, porque es un tema de
facturacion — se le va a cobrar el consumo del bot ahi. No lo hagas tu ni le pidas datos de
pago. Si el dueno es la persona que tienes al frente, los pasos para crear la billetera
estan en `00b-arranque-desde-cero.md` (bloque 5); si es otra persona, diselo asi: *"Esto lo
tiene que hacer el dueno de la cuenta desde Botcake AI, porque implica el cobro del
consumo. Cuando este conectado seguimos."*

### 4. Node.js y el navegador (los instalas tu, con su permiso)

Node.js hace falta para dos cosas: el navegador automatizado que abre Botcake, y el comando
`mibot` que hace el montaje. El navegador es Google Chrome si lo tiene; si no, Chromium, un
navegador que solo usa el plugin. **El usuario no instala nada por su cuenta:** lo instalas
tu, despues de pedirle permiso.

**Como lo compruebas** (corres tu los comandos):

```bash
node -v
```

Si responde `v20` o superior (por ejemplo `v24.22.0`), esta bien: el navegador del plugin no
arranca con menos. Si dice `command not
found` o `no se reconoce`, falta.

Chrome: en Mac, que exista `/Applications/Google Chrome.app`; en Windows, `chrome.exe` dentro
de `Google\Chrome\Application` en `Program Files`, `Program Files (x86)` o `%LOCALAPPDATA%`
(las mismas rutas que mira `scripts/mcp-playwright.cjs` del plugin). Anota los dos resultados
en `mi-bot.json` (`requisitos.nodejs`, `requisitos.chrome`, `requisitos.sistema`).

**Si falta Node, se lo pides asi y esperas el si:**

> *"Para montar el bot necesito instalar Node.js, el programa con el que funciona el plugin.
> Lo bajo de su pagina oficial, compruebo que el archivo no venga alterado y lo instalo. Te va
> a salir una ventana del sistema: en Mac te pide la contrasena de tu computador (la escribes
> tu en esa ventana, nunca en este chat); en Windows, pulsas Si (si no ves la ventana, busca
> un escudo parpadeando en la barra de tareas, abajo). ¿Lo instalo?"*

Con el si, corres el instalador del plugin (desde la carpeta base de esta skill):

- Mac: `sh "<carpeta base de la skill>/scripts/instalar-node.sh"`
- Windows: `powershell -NoProfile -ExecutionPolicy Bypass -File "<carpeta base de la skill>\scripts\instalar-node.ps1"`

Correlo con un tiempo de espera largo (600000 ms): la descarga mas la ventana pueden pasar de
los 2 minutos normales. Si aun asi se corta, antes de repetir mira si ya quedo (`node -v`, o la
ruta completa: `/usr/local/bin/node -v` en Mac, `& "C:\Program Files\nodejs\node.exe" -v` en
Windows). Baja la ultima version LTS de `nodejs.org`, comprueba su suma oficial y abre la
ventana del sistema. La ultima linea dice como fue: `INSTALADO v...` (listo), `YA_ESTABA v...` (ya lo
tenia y esta sesion no lo veia: basta con reiniciar la app) o `ERROR: ...` (le cuentas el
motivo con palabras sencillas; si cancelo la ventana, no se instalo nada y se repite cuando
quiera). Si quieres ver antes que bajaria, `--solo-ver` (Mac) o `-SoloVer` (Windows).

**Si el modo de permisos esta en Auto** y la instalacion se frena o no te deja correrla:
pidele que cambie el selector junto al boton de enviar a Manual, que apruebe ese paso y que
vuelva a Auto despues.

**Si no tiene Chrome** (y ya hay Node), se lo pides asi: *"Para abrir Botcake necesito un
navegador para el plugin. Como no tienes Google Chrome, instalo Chromium, un navegador que
solo usa el plugin: unos 190 MB en tu carpeta de usuario, sin contrasena. ¿Lo instalo?"* Con
el si:

```bash
npx -y -p @playwright/mcp@latest playwright install --no-shell chromium
```

Asi baja justo el Chromium que espera el navegador del plugin. Si Node se acaba de instalar
y `npx` todavia no existe en esta sesion, usa la ruta completa: `/usr/local/bin/npx` en Mac,
`"C:\Program Files\nodejs\npx.cmd"` en Windows.

**Al terminar, que cierre la app de Claude y la vuelva a abrir** (en Mac, con Cmd+Q). El
navegador del plugin y el aviso de version nueva solo ven a Node despues de reiniciar. Antes,
anota en `mi-bot.json` lo instalado, para que con la frase de retomar sigas desde aqui.

**Un aviso al abrir sin Node.** Mientras falte Node, al abrir la sesion Claude Code muestra
un aviso de error del plugin: es el aviso de version nueva, que no puede arrancar. Si el
usuario lo menciona, es eso; no rompe nada y desaparece cuando Node esta instalado.

**En Windows no hace falta Git:** sin Git, Claude Code usa PowerShell, y el plugin trae
`mibot.cmd` para PowerShell.

Despues comprueba tu que el comando del plugin responde:

```bash
mibot
```

Tiene que imprimir la lista de subcomandos. Si dice que `mibot` no existe, usa la ruta
completa que explica `SKILL.md` (seccion "El comando mibot") y anota en `mi-bot.json`
(`requisitos.mibot`) cual de las dos formas funciono, para no volver a probar.

### 5. Una carpeta para el proyecto

Los archivos del bot (el prompt, la base de conocimiento, el diagrama) se van a guardar
donde el usuario abrio Claude Code. Comprueba donde esta:

```bash
pwd && ls
```

Si esta en una carpeta llena de cosas ajenas, sugierele crear una carpeta propia para el
bot (por ejemplo `mi-bot`) y abrir Claude Code ahi.

---

## Como cierras la Fase 0

Cuando los cinco esten en verde, creas `mi-bot.json` a partir de `plantilla-proyecto.json`,
anotas el canal, el nombre de la pagina, el sistema (Mac o Windows) y si tiene Chrome, y
pasas a la Fase 1.

Si alguno esta en rojo, **guardas igual** lo que ya sabes en `mi-bot.json` con el requisito
que falta marcado, y le dices que vuelva cuando lo tenga. Asi al volver no empieza de cero.
