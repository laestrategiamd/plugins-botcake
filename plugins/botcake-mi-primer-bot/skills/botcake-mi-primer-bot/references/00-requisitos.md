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

**Si no lo esta:** lo tiene que conectar **el dueno de la cuenta**, porque es un tema de
facturacion — se le va a cobrar el consumo del bot ahi. No lo hagas tu ni le pidas datos de
pago. Si el dueno es la persona que tienes al frente, los pasos para crear la billetera
estan en `00b-arranque-desde-cero.md` (bloque 5); si es otra persona, diselo asi: *"Esto lo
tiene que hacer el dueno de la cuenta desde Botcake AI, porque implica el cobro del
consumo. Cuando este conectado seguimos."*

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

### 4b. Python 3 disponible

Los comandos de esta skill (`bc.py`, `montar.py`, `guardar_sesion.py`) corren en Python 3.

**Como lo comprueba** (corre tu, y quedate con el PRIMERO que responda una version 3.x):

```bash
python3 --version || python --version || py -3 --version
```

- En **Mac**, `python3` puede abrir una ventana que pide instalar las «herramientas de linea
  de comandos»: que acepte, espere a que termine, y repites el comando.
- En **Windows**, `python3` a veces abre la Microsoft Store en vez de responder: ignoralo y
  prueba `python` o `py -3`. Si ninguno responde, que instale desde `python.org` marcando la
  casilla **«Add Python to PATH»** y **reinicie la app de Claude**.

🔴 **Usa en TODOS los comandos de esta skill el interprete que respondio.** Donde las
referencias dicen `python3`, sustituye por `python` o `py -3` si fue ese el que funciono.
Anotalo en `mi-bot.json` (`requisitos.python`) para no volver a probar en la siguiente tanda.

### 4c. Solo en Windows: Git para Windows

La pestana Code de la app de Claude lo exige la primera vez que se abre en Windows. Si el
usuario esta en Windows y la app no abre Code o le pide Git: que lo instale desde
`git-scm.com` con las opciones que vienen marcadas y reinicie la app. En Mac no aplica.

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

Cuando todos esten en verde (en Windows son siete; en Mac, seis), creas `mi-bot.json` a partir de `plantilla-proyecto.json`,
anotas el canal y el nombre de la pagina, y pasas a la Fase 1.

Si alguno esta en rojo, **guardas igual** lo que ya sabes en `mi-bot.json` con el requisito
que falta marcado, y le dices que vuelva cuando lo tenga. Asi al volver no empieza de cero.
