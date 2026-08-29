# Fases 6 y 7 — Conectar y montar

Aqui se construye el bot de verdad. Unos pasos los haces tu; otros los hace el usuario con
un clic mientras tu le dices exactamente donde. **Los dos tipos de paso estan marcados.**

> 🔴 **La regla de esta fase: despues de cada paso, compruebas.** Botcake tiene varias
> pantallas que muestran el cambio hecho **antes** de guardarlo, y varios botones que abren
> una segunda confirmacion. Es facilisimo dar por hecho que guardo cuando no guardo nada.
> Nunca digas "listo" sin haberlo leido de vuelta.

---

## FASE 6 — Conexion

### Paso 1 — Preparar el navegador `[lo haces tu]`

```bash
npx playwright install chromium
```

Tarda un par de minutos la primera vez. Avisale.

### Paso 2 — El usuario inicia sesion `[lo hace el usuario]`

Abres `botcake.io` en el navegador automatizado y le dices, tal cual:

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

- **La llave de sesion**, que esta en las cookies del navegador (`token_jwt`). Empieza
  siempre por `eyJ`; si lo que copiaste no empieza asi, copiaste otra cosa.
- **El identificador de la pagina**, que aparece en las direcciones que consulta Botcake
  mientras el usuario navega. ⚠️ **No lo saques de la barra de direcciones**: en las
  cuentas de WhatsApp el identificador de la barra y el que usa Botcake por dentro no
  siempre son el mismo, y con el equivocado todo falla despues sin decir por que. Pidele al
  usuario que haga clic en su pagina, y lo lees del trafico.

Con los dos:

```bash
python3 scripts/guardar_sesion.py "<llave>" "<identificador de la pagina>"
```

Esto los escribe en `.botcake-sesion`, solo legible por el usuario, y anade ese archivo y
`mi-bot.json` al `.gitignore` para que nunca se suban a ningun lado.

**La llave caduca.** Si en la tanda siguiente algo falla con un aviso de sesion, se repiten
los pasos 2 y 3 y ya.

### Paso 4 — Comprobar que funciona `[lo haces tu]`

```bash
python3 scripts/bc.py probar
```

Tiene que responder que la conexion es correcta y decir cuantas etiquetas hay en esa
pagina. Enseñaselo al usuario.

Si falla, ve a `08-cuando-falla.md`.

---

## FASE 7 — El montaje, en orden

El orden importa: cada paso necesita el anterior.

### Paso 5 — Las etiquetas `[lo haces tu]`

Las etiquetas son marcas que se le ponen a una conversacion para saber en que va.

```bash
python3 scripts/bc.py crear-etiqueta "Asesor" "#e74c3c"
```

⚠️ **Maximo 15 caracteres por etiqueta.** Es un limite duro: nombres mas largos fallan.
"Cliente calificado" no cabe; "Lead" o "Calificado" si.

Las minimas de cualquier bot: una para avisar que hay que atender a mano (`Asesor`) y una
para marcar al interesado (`Lead`). Guarda los identificadores en `mi-bot.json`.

### Paso 6 — Los campos `[lo haces tu]`

Son las casillas donde el bot guarda lo que averigua (nombre, ciudad, producto de interes).

```bash
python3 scripts/bc.py crear-campo "Nombre"
```

Crealos **todos como texto**, aunque sean opciones o numeros: el agente solo escribe texto.

### Paso 7 — Crear el agente `[lo hace el usuario, tu le indicas]`

Guialo pantalla por pantalla:

> 1. En Botcake, menu de la izquierda: **Botcake AI** → **Lista de Agentes**.
> 2. Boton **Crear nuevo agente**.
> 3. Nombre: `<el nombre del bot>`. Descripcion: una linea.
> 4. ⚠️ **Deja SIN marcar la casilla "Usar como agente predeterminado".** Esa casilla es la
>    que lo pone a atender, y todavia no lo hemos probado.
> 5. Guardar.

Cuando termine, lees el identificador del agente de la direccion de la pantalla
(`.../agents/<numero>`) y lo guardas en `mi-bot.json`.

### Paso 8 — Pegar el prompt `[lo hace el usuario, tu le indicas]`

**Esto no se puede automatizar.** El campo donde va el prompt es un editor especial que
rechaza el texto puesto por programa: se ve escrito pero al guardar manda el texto viejo.
Se pega a mano y son diez segundos.

> 1. Abre el archivo `prompt-<negocio>.txt` que te genere (esta en `<ruta>`).
> 2. Selecciona todo (Cmd+A o Ctrl+A) y copia (Cmd+C o Ctrl+C).
> 3. En Botcake, dentro del agente, pestana **Instruccion**. Borra lo que haya.
> 4. Pega (Cmd+V o Ctrl+V).
> 5. **Guardar** → 🔴 **sale una ventana que pregunta si estas seguro. Pulsa Confirmar.**
>    Si no la confirmas, no se guarda nada y la pantalla se ve igual.

**Compruebalo tu:**

```bash
python3 scripts/bc.py ver-agente <id>
```

Le ensenas al usuario cuantos caracteres quedaron y las primeras lineas, y le confirmas que
coincide con el archivo. Si quedo vacio o quedo el texto viejo, se repite el paso.

### Paso 9 — Subir la base de conocimiento `[lo hace el usuario, tu le indicas]`

Este camino tiene tres trampas seguidas. Diselas antes, no despues:

> 1. Dentro del agente, pestana **Conocimiento** → **Anadir archivos**.
> 2. Boton **Subir** → elige el archivo `conocimiento-<negocio>.txt` (esta en `<ruta>`).
> 3. Se abre una ventana que dice **Importar datos**. Eso solo lo prepara. Pulsa
>    **Confirmar**.
> 4. En la lista, **marca la casilla del archivo nuevo**. Si hay uno viejo, desmarcalo.
> 5. Pulsa **Agregar a la instruccion**.
> 6. 🔴 **Pulsa Guardar y confirma otra vez.** Entre el paso 5 y el 6 la pantalla ya se ve
>    con el archivo puesto **y todavia no se ha guardado nada**. Si te quedas ahi, el bot no
>    tiene la informacion y parece que si.

**Compruebalo tu:**

```bash
python3 scripts/bc.py ver-conocimiento <id>
```

Este comando no mira la pantalla: descarga el archivo que el agente tiene enganchado ahora
mismo y busca dentro una frase que tu elijas de la base de conocimiento. Si la encuentra,
entro de verdad.

### Paso 10 — Los ajustes que casi nadie toca `[lo hace el usuario, tu le indicas]`

Cuatro cosas, y las cuatro cambian como se porta el bot:

| Ajuste | Donde | Como se deja |
|--------|-------|--------------|
| **Historial de chat** | Botcake AI → General → *Habilitar historial de chat* | **ENCENDIDO**. Si esta apagado el bot no recuerda nada y repite las mismas preguntas, por mucho que el prompt lo prohiba. Es la queja numero uno. |
| **Modelo** | Dentro del agente | El que el usuario prefiera segun su presupuesto. Uno mas caro no arregla un prompt malo. |
| **Horario** | Configuracion → Horario de funcionamiento | Solo si el usuario NO quiere que conteste de noche. Si quiere 24 horas, no se toca. |
| **Pausa cuando contesta una persona** | Configuracion → Conversacion de Pancake → *Cuando el personal responde* | Ponla en 2 horas como minimo. Es lo que evita que el bot escriba encima de un asesor. |

### Paso 11 — Montar el flujo `[lo haces tu]`

```bash
python3 scripts/montar.py
```

Lee `mi-bot.json` y construye el flujo completo: el paso que enciende el agente, el agente,
el revisor y cada rama con sus acciones.

Despues lo lees de vuelta y le ensenas al usuario un resumen: cuantos pasos quedaron y que
hace cada rama.

### Paso 12 — Dejarlo apagado y cerrar la tanda

**No conectes el punto de entrada todavia.**

En Botcake, un flujo que no esta conectado a un punto de entrada **no se dispara nunca**, y
no da ningun error: se ve perfecto en el editor y no le contesta a nadie. Eso, ahora mismo,
es exactamente lo que queremos: el bot esta montado y callado hasta que lo probemos.

Diselo asi:

> "El bot ya esta montado completo, y esta apagado a proposito. No le contesta a nadie
> todavia. En la siguiente tanda lo probamos y, si te gusta como responde, lo encendemos."

Guarda todo en `mi-bot.json` y cierra la tanda 3.
