# Cuando algo falla

**La regla:** el usuario tiene que poder terminar su bot aunque la parte automatica se
rompa. Nunca lo dejas a medias y sin salida. Si un paso automatico falla dos veces, pasas
al plan B de ese paso y sigues.

Y diselo con claridad, sin adornos: *"esto no me esta funcionando por mi lado; lo vamos a
hacer de otra forma, tu haces estos clics y yo te voy diciendo."*

---

## `mibot` no existe / `command not found` / `no se reconoce`

El acceso corto no entro al PATH de la terminal. Se llama por su ruta completa, entre
comillas (ver `SKILL.md`, seccion "El comando mibot"):

```bash
node "<carpeta base de la skill>/scripts/mibot.cjs" probar
```

Si tampoco: `node -v`. Si eso falla, es Node.js (abajo).

---

## `node: command not found` o `npx` falla

**Node.js no esta, o se instalo despues de abrir la app.**

- Si dice `command not found` / `no se reconoce`: no esta instalado, o la app de Claude se
  abrio antes de instalarlo. Que cierre y vuelva a abrir la app.
- Si la version es menor que 18: que actualice desde `nodejs.org`.
- Si falla por permisos o por red: que lo corra el mismo en su terminal y te diga que sale.

---

## El navegador no abre, o abre en blanco

Que cierre cualquier otra ventana del navegador automatizado que haya quedado abierta y lo
intente otra vez. Si dice que no encuentra un navegador: `npx playwright install chromium`
(un par de minutos). Si sigue, **plan B: todo el montaje a mano** (abajo).

---

## `mibot probar` falla con `Invalid access_token` (codigo 102)

Una de dos:

1. **La llave caduco.** Se repiten los pasos 2 y 3 de la Fase 6 (el usuario comprueba que
   sigue con la sesion iniciada en el navegador; si se cerro, entra otra vez; tu vuelves a
   leer la cookie y corres `mibot sesion`).
2. **Se copio la clave equivocada.** La "Api key" que enseña el panel de la pagina en
   Botcake NO sirve para esto; la que sirve es la cookie `token_jwt` del navegador. Las dos
   empiezan por `eyJ`, asi que la forma no delata el error: solo lo delata este codigo 102.

Si vuelve a fallar, plan B.

---

## `subir-kb` dice "ya tiene un archivo con este mismo contenido"

No es un error: Botcake no vuelve a subir un archivo identico a uno que ya subio alguna
vez. Cambia la linea `# Actualizado:` de la cabecera del archivo (fecha y hora) y repite.

---

## `subir-kb` dice "No pude comprobar el archivo subido"

Botcake recibio el archivo pero no dejo descargarlo para comprobarlo (a veces responde con
un error 502 justo despues de subir). El comando lo reintenta durante un minuto y, si sigue
sin poder, **no lo engancha al agente**: no se toca nada sin comprobarlo. El archivo si
quedo en la biblioteca de la pagina, asi que repetir tal cual daria "ya tiene un archivo
con este mismo contenido": cambia la linea `# Actualizado:` de la cabecera y repite. La
ficha del archivo queda guardada en la carpeta `respaldos/` por si hace falta.

---

## Un paso de montaje falla o el resultado no coincide

Nunca lo repitas a ciegas mas de una vez: puedes dejar cosas duplicadas. Lee primero lo que
hay, se lo ensenas al usuario, y decidan juntos.

```bash
mibot estado
```

Ese comando lista lo que ya existe (etiquetas, casillas, agentes) para saber que se
alcanzo a crear. `mibot montar` se puede repetir sin miedo: si `mi-bot.json` ya tiene el
numero del flujo, lo reescribe en vez de crear otro, y las etiquetas y casillas que ya
existen las reutiliza.

---

## Plan B: montarlo a mano

Si la parte automatica no se puede usar, el usuario **igual termina**. Lo que le entregas:

1. El archivo del prompt y el de la base de conocimiento (ya los tiene desde la tanda 2).
2. El diagrama del flujo (ya lo tiene desde la Fase 4).
3. Una guia escrita, paso a paso, para armar el flujo en el editor visual de Botcake:
   cuantos pasos, que va en cada uno, y que frase busca cada rama del revisor.

Generas esa guia con lo que hay en `mi-bot.json` y la guardas como
`montaje-manual-<negocio>.md`. Le adviertes que son entre 30 y 60 minutos de clics, y le
ofreces acompanarlo paso a paso.

---

## Botcake cambio y la skill no lo sabe

Puede pasar: es su plataforma y la cambian cuando quieren. Las senales son que un comando
que antes funcionaba empieza a devolver errores raros, o que la pantalla que describe esta
guia ya no se parece a la que ve el usuario.

**Que haces:**

1. **No insistas ni improvises** por la via automatica.
2. Diselo claro: *"Botcake cambio algo desde que se escribio esta guia. Lo hacemos a mano y
   yo te voy indicando."*
3. Pasas al plan B.
4. Pidele al usuario que reporte el fallo a quien le entrego el plugin, con la fecha y lo
   que salio en pantalla, para que se pueda corregir.

---

## Un paso se frena y no aparece ninguna solicitud de permiso

Es el modo de permisos Auto de la app de Claude: bloquea en silencio algunas acciones con
credenciales (como guardar la llave de sesion). Pidele al usuario que cambie el selector de
permisos (al lado del boton de enviar) a **Manual**, que apruebe ese paso cuando se lo
pregunte, y que despues vuelva a **Auto**.

---

## El bot dejo de contestar de golpe

Casi siempre es el saldo. Que mire en Botcake > Configuracion > Facturacion la linea
**BOTCAKE AI** de la cuenta prepago: en cero, la IA se calla sin avisar. En un bot real
paso casi 9 horas, con la recarga automatica configurada.

Si hay saldo: `mibot verificar --encendido`. Si la base sale sin indice, el comando la
repara; si la Respuesta predeterminada ya no apunta al flujo, alguien la cambio. Y
`mibot respuestas`: si muchas conversaciones tienen la etiqueta `IA sin resp`, el agente
esta fallando.

---

## El bot ya esta encendido y responde mal

Primero se apaga, despues se arregla. En ese orden.

> Botcake → Automatizacion → Respuesta predeterminada → quitar el flujo.

Con el bot apagado, se mira que fallo:

| Sintoma | Donde esta el problema |
|---------|------------------------|
| Da datos errados o inventa precios | Base de conocimiento (`04-base-conocimiento.md`), o el archivo perdio su indice (`mibot verificar` lo revisa y lo repara) |
| Contesta a menudo que no alcanzo a entender | El agente esta fallando: saldo de Botcake AI, o `mibot verificar` |
| Repite preguntas que ya hizo | El historial de chat esta apagado (paso 9 del montaje) |
| Ignora reglas del prompt que antes cumplia | El agente quedo en modo Rapido (paso 9 del montaje): puede pasar al escribir el prompt o la KB por comando |
| No avisa al equipo, no pone etiquetas | La frase ancla del prompt no coincide **exactamente** con la que busca el revisor, o el prompt dice que "el sistema" lo hace |
| Contesta encima de un asesor | La rama de escalado no apaga el agente, o la pausa tras respuesta humana esta apagada |
| No guarda el nombre ni la ciudad del cliente | La extraccion de datos no quedo configurada (paso 7 del montaje) |
| Habla en otro tono del que se pidio | Prompt (`03-prompt.md`), seccion COMO HABLAS; mira si copio un ejemplo como guion |
