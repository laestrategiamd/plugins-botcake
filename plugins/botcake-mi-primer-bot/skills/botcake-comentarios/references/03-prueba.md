# Fase 4: encender y probar

## El "si"

Antes de tocar el boton, pregunta con estas palabras:

> "Todo esta montado y apagado. Si lo enciendo, desde ese momento cada persona que comente
> en tu pagina va a recibir la respuesta publica y el mensaje privado, y se van a ocultar
> los comentarios con telefonos, enlaces o las palabras de la lista. ¿Lo enciendo?"

Sin un "si" con palabras, no se enciende. Si dice que no o que despues, guardas
`mis-comentarios.json` con `encendido: false` y ahi queda.

---

## Encender

1. En `botcake.io/<identificador>/comment`, pulsa **Guardar y activar** (boton del
   encabezado). Si el clic no responde, este codigo lo pulsa por dentro de la pagina:
   ```js
   () => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Guardar y activar'); b.click(); }
   ```
2. **Recarga la pagina** y comprueba tres cosas leyendola: que "Respuesta automatica a
   comentarios" y "Bandeja de entrada automatica" siguen encendidos, y que en la pestaña
   Bandeja de entrada sigue el flujo `DM ...` enlazado. Sin recargar no vale: la pantalla
   puede mostrar todo encendido sin haberlo guardado.
3. Guarda `mis-comentarios.json` (`cuentas.<red>.encendido: true`).

---

## La prueba real (la hace el usuario)

Tu no puedes comentar por el: se hace desde su cuenta personal. Diselo asi:

> "Ahora la prueba. Desde tu cuenta personal (no la de la marca), comenta cualquier
> publicacion de tu pagina con algo como 'me interesa'. Deberian pasar dos cosas en menos
> de un minuto: una respuesta debajo de tu comentario con tu nombre, y un mensaje privado
> con el enlace a tu WhatsApp. Cuentame que ves."

Despues, la moderacion:

> "Ahora comenta con un numero de telefono cualquiera, por ejemplo 'llamenme al 300 123
> 4567'. Ese comentario deberia desaparecer solo (ocultarse). Y si quieres, comenta con
> una de las palabras de la lista para ver que tambien se oculta; ojo, esa te bloquea a ti
> en tu propia pagina, asi que mejor con una cuenta de prueba, o despues la desbloqueas."

Lo que tiene que pasar:

| Prueba | Resultado esperado |
|---|---|
| Comentario normal | Respuesta publica con su nombre, y mensaje privado |
| Comentario con telefono | Se oculta |
| Comentario con palabra de la lista | Se oculta, y se bloquea a quien lo escribio |
| En Facebook | La respuesta publica trae el enlace y se puede pulsar; el comentario recibe un me gusta |
| En Instagram | La respuesta publica trae el numero escrito; el privado 5 trae el boton "Ir a WhatsApp" |

Si el mensaje privado no llega: revisa que el flujo siga enlazado en la pestaña Bandeja de
entrada. Si la respuesta publica no sale: revisa el interruptor "Respuesta automatica a
comentarios", y si esa publicacion tiene "Solo responder por publicacion" activo (eso anula
la configuracion general para ese post).

---

## Lo que le entregas al cerrar

Un resumen corto en el chat:

- Que quedo montado en cada cuenta (respuestas publicas, mensaje privado, moderacion).
- **Como apagarlo si algo sale mal**, para que lo haga solo:

  > Botcake > tu pagina > Comentarios > apagar el interruptor "Respuesta automatica a
  > comentarios". Deja de responder al instante.

- **Que revisar cada semana:** que los interruptores sigan encendidos. Se ha visto que
  algunas cuentas se apagan solas con el tiempo. Y si Facebook empieza a ocultar sus
  respuestas publicas, quitar el enlace del texto y dejar solo "escribenos por WhatsApp".
- **Como cambiar un texto:** que abra Claude Code en la misma carpeta y te lo pida. Tu lo
  cambias en Botcake (haciendo clic sobre el texto de la tarjeta, no en Eliminar) y
  compruebas recargando.

Si falta la segunda cuenta (Instagram o Facebook), cierra la tanda y recuerda que la
siguiente empieza otra vez en la Fase 3 con los textos de esa red.
