# Cuando algo falla

**La regla:** el usuario tiene que poder terminar su bot aunque la parte automatica se
rompa. Nunca lo dejas a medias y sin salida. Si un paso automatico falla dos veces, pasas
al plan B de ese paso y sigues.

Y diselo con claridad, sin adornos: *"esto no me esta funcionando por mi lado; lo vamos a
hacer de otra forma, tu haces estos clics y yo te voy diciendo."*

---

## `npx playwright install` falla

**Casi siempre es Node.js.** Comprueba:

```bash
node -v
```

- Si dice `command not found`: no esta instalado, o Claude Code se abrio antes de
  instalarlo. Que cierre y vuelva a abrir Claude Code.
- Si la version es menor que 18: que actualice desde `nodejs.org`.
- Si falla por permisos o por red: que lo corra el mismo en su terminal y te diga que sale.

---

## El navegador no abre, o abre en blanco

Que cierre cualquier otra ventana del navegador automatizado que haya quedado abierta y lo
intente otra vez. Si sigue, **plan B: todo el montaje a mano** (abajo).

---

## `bc.py probar` falla

1. **Que el usuario compruebe que sigue con la sesion iniciada** en la ventana del
   navegador. Si se cerro, que entre otra vez.
2. **La llave de sesion caduca.** Se repiten los pasos 2 y 3 de la Fase 6.
3. Si vuelve a fallar, plan B.

---

## Un paso de montaje falla o el resultado no coincide

Nunca lo repitas a ciegas mas de una vez: puedes dejar cosas duplicadas. Lee primero lo que
hay, se lo ensenas al usuario, y decidan juntos.

```bash
python3 scripts/bc.py estado
```

Ese comando lista lo que ya existe (etiquetas, campos, agente, flujo) para saber que se
alcanzo a crear.

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

## El bot ya esta encendido y responde mal

Primero se apaga, despues se arregla. En ese orden.

> Botcake → Automatizacion → Respuesta predeterminada → quitar el flujo.

Con el bot apagado, se mira que fallo:

| Sintoma | Donde esta el problema |
|---------|------------------------|
| Da datos errados o inventa precios | Base de conocimiento (`04-base-conocimiento.md`) |
| Repite preguntas que ya hizo | El historial de chat esta apagado (paso 10 del montaje) |
| No avisa al equipo, no pone etiquetas | La frase ancla del prompt no coincide **exactamente** con la que busca el revisor |
| Contesta encima de un asesor | La rama de escalado no apaga el agente, o la pausa tras respuesta humana esta muy corta |
| Habla en otro tono del que se pidio | Prompt (`03-prompt.md`), seccion COMO HABLAS |
