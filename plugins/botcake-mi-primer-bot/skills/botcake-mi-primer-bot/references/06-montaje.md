# Fases 6 y 7 — Conectar y montar

Aqui se construye el bot de verdad. Casi todo lo haces tu con `mibot`; el usuario pone las
manos solo donde la plataforma no deja otra salida, y siempre con un clic mientras tu le
dices exactamente donde. **Los dos tipos de paso estan marcados.**

> 🔴 **La regla de esta fase: despues de cada paso, compruebas.** Botcake tiene varias
> pantallas que muestran el cambio hecho **antes** de guardarlo, varios botones que abren
> una segunda confirmacion, y respuestas que dicen "success" sin haber guardado nada. Es
> facilisimo dar por hecho que guardo cuando no guardo. Nunca digas "listo" sin haberlo
> leido de vuelta. Cada subcomando de `mibot` relee y te lo dice.

Todos los comandos se corren **desde la carpeta del proyecto del usuario**.

---

## FASE 6 — Conexion

### Paso 1 — Abrir Botcake en el navegador automatizado `[lo haces tu]`

Con la herramienta del navegador del plugin, abre `https://botcake.io`. Si el usuario tiene
Google Chrome, se usa ese y no hay que instalar nada. Si la herramienta responde que no
encuentra un navegador, instala uno con:

```bash
npx playwright install chromium
```

Tarda un par de minutos la primera vez. Avisale.

### Paso 2 — El usuario inicia sesion `[lo hace el usuario]`

Con Botcake abierto en el navegador automatizado, dile, tal cual:

> "Se abrio una ventana del navegador en Botcake. **Inicia sesion tu ahi**, con tu correo y
> tu contrasena. Yo no las veo ni las necesito. Cuando ya estes dentro y veas tu pagina,
> escribeme *listo*."

**Tu no pides usuario ni contrasena, nunca.** Si el usuario te las escribe en el chat de
todos modos: diselo, pidele que cambie la contrasena, y sigue con este mismo procedimiento.

La sesion queda guardada en el perfil del navegador, asi que en las siguientes tandas ya no
tiene que volver a entrar.

### Paso 3 — Guardar la llave de sesion `[lo haces tu]`

Cuando confirme que esta dentro, necesitas dos cosas del navegador y las dos las sacas tu,
sin pedirle nada:

- **La llave de sesion**, que esta en las cookies del navegador (`token_jwt`). Se lee
  ejecutando esto en la pestana de Botcake:
  `document.cookie.split('; ').find(c => c.startsWith('token_jwt=')).slice(10)`
  Empieza siempre por `eyJ`; si lo que copiaste no empieza asi, copiaste otra cosa.
- **El identificador de la pagina**, que aparece en las direcciones que consulta Botcake
  mientras el usuario navega (`/api/v1/pages/<identificador>/...`). ⚠️ **No lo saques de la
  barra de direcciones**: en las cuentas de WhatsApp el identificador de la barra y el que
  usa Botcake por dentro no siempre son el mismo, y con el equivocado todo falla despues sin
  decir por que. Pidele al usuario que haga clic en su pagina, y lo lees del trafico de red.

Con los dos:

```bash
mibot sesion "<llave>" "<identificador de la pagina>"
```

Esto los escribe en `.botcake-sesion`, solo legible por el usuario, y anade ese archivo,
`mi-bot.json` y la carpeta de respaldos al `.gitignore` para que nunca se suban a ningun
lado.

**La llave caduca.** Si en la tanda siguiente algo falla con `Invalid access_token`, se
repiten los pasos 2 y 3 y ya.

### Paso 4 — Comprobar que funciona `[lo haces tu]`

```bash
mibot probar
```

Tiene que responder que la conexion es correcta y decir cuantas etiquetas hay en esa
pagina. Enseñaselo al usuario.

Si falla, ve a `08-cuando-falla.md`.

### Paso 4b — Respaldo de lo que ya hay `[lo haces tu]`

```bash
mibot respaldo
```

Baja a la carpeta `respaldos/` todos los agentes que ya tenga la pagina, completos, y la
lista de flujos. **Es obligatorio antes de escribir nada**: Botcake no tiene papelera ni
historial, y si un paso se equivoca de agente, ese archivo es lo unico que permite
recuperar el prompt. Dile al usuario que existe y donde esta.

---

## FASE 7 — El montaje, en orden

El orden importa: cada paso necesita el anterior. El usuario solo pone las manos en dos
momentos: crear el agente vacio (paso 5) y los ajustes del agente (paso 9).

> 💡 **Los pasos 6, 7 y 8 escriben en el agente, y escribir por comando puede cambiar el
> modo del agente de «Detalle» a «Rapido»** (antes pasaba siempre; en septiembre de 2026
> dejo de pasar en algunas cuentas). Por eso van seguidos, y el modo se revisa UNA vez, al
> final, en el paso 9. No mandes al usuario a la pantalla entre medias.

### Paso 5 — Crear el agente vacio `[lo hace el usuario, tu le indicas]`

Guialo pantalla por pantalla:

> 1. En Botcake, menu de la izquierda: **Botcake AI** → **Lista de Agentes**.
> 2. Boton **Crear nuevo agente**.
> 3. Nombre: `<el nombre del bot>`. Descripcion: una linea.
> 4. ⚠️ **Deja SIN marcar la casilla "Usar como agente predeterminado".** Esa casilla es la
>    que lo pone a atender, y todavia no lo hemos probado.
> 5. Guardar.

Cuando termine, lees el identificador del agente de la direccion de la pantalla
(`.../agents/<numero>`) y lo guardas en `mi-bot.json` (`montaje.agente_id`). Compruebalo:

```bash
mibot ver-agente <id_agente>
```

Tiene que salir con el nombre que le puso y el prompt vacio.

> 🔴 **Nunca intentes crear el agente por comando.** No existe una forma segura: la que
> parece existir escribe encima del agente que ya esta atendiendo y le borra el prompt.
> Son tres clics del usuario y se acabo.

### Paso 6 — Escribir el prompt `[lo haces tu]`

```bash
mibot poner-prompt <id_agente> prompt-<negocio>.txt
```

Comprueba que cabe en 15.000 caracteres (si no, no escribe nada), escribe los **dos**
campos donde vive el prompt (el texto plano y el del editor), y relee: el numero de
caracteres tiene que coincidir en los dos con el archivo. Si se escribiera solo uno, el
agente seguiria con el prompt viejo y la comprobacion no lo delataria.

**Si el comando falla dos veces**, plan B — el pegado a mano (son 10 segundos):

> 1. Abre `prompt-<negocio>.txt`, selecciona todo y copia.
> 2. En el agente, pestana **Instruccion**. Borra lo que haya y pega.
> 3. **Guardar** → 🔴 **confirma en la ventana que sale.** Sin ese Confirmar no se guarda
>    nada y la pantalla se ve igual.

Y comprueba igual con `mibot ver-agente <id>`.

### Paso 7 — Subir la base de conocimiento `[lo haces tu]`

```bash
mibot subir-kb <id_agente> conocimiento-<negocio>.txt "<una frase del archivo>"
```

Sube el archivo, comprueba que lo que quedo en Botcake es identico al archivo local, lo
engancha al agente, y espera (hasta 48 segundos) a que Botcake lo indexe. Lo unico que
importa es que la ficha del archivo traiga **los dos identificadores del indexado**; sin
ellos el archivo esta en la biblioteca pero el bot NO lo lee. Al final descarga lo que el
agente tiene puesto y busca la frase dentro.

Dos cosas que pueden pasar y no son errores tuyos:

- **"Botcake ya tiene un archivo con este mismo contenido"**: Botcake no vuelve a subir un
  archivo identico a uno que ya subio alguna vez (aunque no este enganchado). Cambia la
  linea `# Actualizado:` de la cabecera del archivo y repite.
- **"quedo adjunto pero NO indexado"**: a veces tarda mas. Espera un minuto y comprueba con
  `mibot ver-conocimiento <id> "<frase>"`.

**Al reemplazar una KB** (mantenimiento, no primer montaje): sube la nueva con el mismo
comando (queda **junto** a la vieja), comprueba que la nueva esta indexada, y **en un
segundo paso quita la vieja**. Nunca al reves: si quitas primero, el agente se queda sin
conocimiento entre los dos pasos. No hay forma de borrar un archivo de la biblioteca de la
pagina; solo se desengancha del agente.

**Si el comando falla dos veces**, plan B por la interfaz:

> Conocimiento → **Anadir archivos** → **Subir** (ese boton ya abre el selector; no pulses
> ademas la zona de arrastrar) → elegir el archivo → **Confirmar** → marcar el archivo
> nuevo y desmarcar el viejo → **Agregar a la instruccion** → **Guardar → Confirmar**.
> 🔴 Entre marcar y Guardar la pantalla ya se ve con el archivo puesto **y no se ha guardado
> nada**.

Comprueba igual con `mibot ver-conocimiento <id> "<frase>"`.

### Paso 8 — La extraccion de datos `[lo haces tu]`

Es lo que hace que el bot **guarde** lo que averigua (nombre, ciudad, producto de
interes) en las casillas del cliente, donde el equipo lo ve al abrir la conversacion.
Sin este paso el bot pregunta el nombre y no lo anota en ningun lado.

Antes del comando, en `mi-bot.json` cada dato de `estilo.datos_a_capturar` tiene que tener
su instruccion de extraccion (la escribes tu, viene del bloque H del cuestionario):

```json
"datos_a_capturar": [
  {"campo": "Nombre", "instruccion": "El primer nombre del cliente, como lo dijo el. Si no lo dijo, vacio."},
  {"campo": "Ciudad", "instruccion": "La ciudad donde esta el cliente o a donde quiere el envio. Si no la dijo, vacio."},
  {"campo": "Interes", "instruccion": "El producto o servicio por el que pregunta, con el nombre exacto del catalogo. Si no lo dijo, vacio."}
]
```

Cada instruccion: que es el dato + como lo suele decir el cliente + formato exacto + "si no
lo dijo, vacio". **Maximo 200 caracteres cada una** (el comando lo comprueba). Luego:

```bash
mibot extraer-datos <id_agente>
```

Crea las casillas que falten (todas de texto) y configura la extraccion en el agente.
Relee y te dice cuantas quedaron.

### Paso 9 — Los ajustes del agente `[lo hace el usuario, tu le indicas]`

Cinco cosas, y las cinco cambian como se porta el bot. Van todas seguidas, en un solo
recorrido por la pantalla:

| Ajuste | Donde | Como se deja |
|--------|-------|--------------|
| **Modo Detalle** | Dentro del agente, arriba: un boton que dice **«Detalle ▾»** o **«Rapido ▾»**, al lado de «Mejoras de IA» | Clic en ese boton → en el menu que se abre, elegir **Detalle** (la opcion elegida lleva ✓). Si la pantalla pide guardar: **Guardar → Confirmar**. En Rapido el bot no lee el prompt completo. Se comprueba a ojo: recargar la pagina, abrir otra vez ese menu y ver el ✓ en Detalle. No por comando. |
| **Historial de chat** | Botcake AI → General → *Habilitar historial de chat* | **ENCENDIDO**. Si esta apagado el bot no recuerda nada y repite las mismas preguntas, por mucho que el prompt lo prohiba. Es la queja numero uno. |
| **Audiencia** | Botcake AI → General | **Todos**. En "Administradores" solo le contesta a los administradores de la pagina: sirve para probar, mortal si se queda asi. |
| **Modelo** | Dentro del agente | El que el usuario prefiera segun su presupuesto. Uno mas caro no arregla un prompt malo. |
| **Pausa cuando contesta una persona** | Configuracion → Conversacion de Pancake → *Cuando el personal responde* → **Pausar Botcake AI** | Encendido, con la duracion en **1 hora** (es el maximo que ofrece). Es lo que evita que el bot escriba encima de un asesor. No confundir con el interruptor vecino "Pausar Bot", que apaga todos los flujos. |
| **Horario** | Configuracion → Horario de funcionamiento | Solo si el usuario NO quiere que conteste de noche. Si quiere 24 horas, no se toca. |

Cuando termine, `mibot ver-agente <id>` tiene que seguir mostrando el prompt completo y el
archivo enganchado (los ajustes de pantalla no los tocan, pero se comprueba igual).

### Paso 10 — Montar el flujo `[lo haces tu]`

```bash
mibot montar
```

Lee `mi-bot.json`, comprueba que cada frase ancla esta escrita tal cual en el prompt del
agente (si no, se niega y te dice cual falta), crea las etiquetas y las casillas que
falten, y construye el flujo completo: la puerta, el agente, el revisor, cada rama con sus
acciones y la espera que cierra el circulo. Lo relee y te dice cuantos pasos quedaron.

Enseñale al usuario un resumen: cuantos pasos quedaron y que hace cada rama. Si quiere
verlo, la pantalla es Botcake → **Automatizacion** → **Flujos** → el flujo con el nombre
del bot.

### Paso 11 — Dejarlo apagado y cerrar la tanda

**No conectes el punto de entrada todavia.**

En Botcake, un flujo que no esta conectado a un punto de entrada **no se dispara nunca**, y
no da ningun error: se ve perfecto en el editor y no le contesta a nadie. Eso, ahora mismo,
es exactamente lo que queremos: el bot esta montado y callado hasta que lo probemos.

Diselo asi:

> "El bot ya esta montado completo, y esta apagado a proposito. No le contesta a nadie
> todavia. En la siguiente tanda lo probamos y, si te gusta como responde, lo encendemos."

Guarda todo en `mi-bot.json` y cierra la tanda 3.
