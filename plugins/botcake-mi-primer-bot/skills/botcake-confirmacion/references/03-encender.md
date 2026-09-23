# Fase 4: encender, conectar el POS y probar

Encender son dos cosas, y van en este orden:

1. **Los tres pasos de la secuencia** (`mibot encender-confirmacion`). Solos no mandan nada:
   nadie ha entrado todavia a la secuencia.
2. **La regla del POS** que mete cada pedido nuevo en la secuencia. Desde que se guarda,
   cada pedido nuevo recibe el WhatsApp.

Justo despues va la prueba con un pedido a su propio numero.

---

## Paso 1. Revisar y pedir el "si"

```bash
mibot verificar-confirmacion
```

Todo `OK`. Si en la Fase 0 el usuario dijo que ya le llega otra confirmacion automatica
(`otra_confirmacion_activa`), primero se decide con el cual se queda: con las dos
encendidas el cliente recibe dos mensajes. Esa otra la apaga el usuario, o tu con su
permiso y diciendole donde.

Despues preguntas con estas palabras:

> "Todo esta montado y apagado. Para encenderlo prendo los tres pasos y creo en tu POS la
> regla que manda cada pedido nuevo a este sistema. Desde ese momento, a cada cliente que
> haga un pedido le llega el WhatsApp de confirmacion, y cada mensaje se descuenta de tu
> saldo. Enseguida probamos con un pedido a tu propio numero. ¿Lo enciendo?"

Sin un "si" con palabras, no se enciende. Si dice que no o que despues, guardas
`mi-confirmacion.json` y ahi queda.

## Paso 2. Encender los pasos

```bash
mibot encender-confirmacion
```

Tiene que decir `ENCENDIDO` en los tres. Si alguno queda apagado, el comando dice donde
encenderlo en pantalla (el interruptor «Activar» de la fila del paso).

## Paso 3. La regla del POS

La hace el navegador del plugin; el usuario inicia sesion en `pos.pancake.vn` (tu no ves
ni pides la contrasena). Si prefiere hacer los clics el, lo guias pantalla por pantalla.
Lee la pantalla antes de cada clic: los nombres pueden variar un poco.

1. En su tienda: **Ajustes** > **Notificación** > pestaña **«Actualizaciones de pedidos»**.
   Mira primero las reglas que ya hay: si alguna ya manda una secuencia de Botcake en el
   estado Nuevo, avisale antes de crear otra.
2. **Agregar** > pestaña **Botcake**.
3. Llena:
   - **Nombre:** `Confirmación de pedidos`.
   - **Cuando:** el estado del pedido **Nuevo**.
   - **Origen del pedido:** los que anotaste en `origen_de_los_pedidos`. Si el pedido de
     prueba se va a crear a mano en el POS, sale con origen **Sin fuente**: marcalo
     tambien, o la prueba no dispara nada. (Dejarlo marcado sirve para que los pedidos que
     el equipo carga a mano tambien se confirmen.)
   - En la tabla de la pagina: la pagina de **WhatsApp** del usuario;
     **«Agregar etiquetas de Botcake»**: `Pedido nuevo` y `R1` (las pone tambien el paso 1;
     aqui quedan de respaldo); **«Eliminar etiquetas de Botcake»**: `Confirmado` y
     `Sin respuesta` (para que un cliente que ya compro antes no aparezca como confirmado
     en su pedido nuevo); **secuencia**: `Confirmación de pedidos`.
4. **Guardar**, y comprueba que la regla quedo **encendida** en la lista.
5. **Comprueba:** recarga la pantalla y lee la regla: nombre, estado Nuevo, pagina y
   secuencia. El editor de una regla es el lapiz de la ultima columna (aparece al pasar el
   raton); hacer clic en la fila no abre nada.

Guarda `mi-confirmacion.json` (`encendido.pos_conectado: true`).

No confundir con **Ajustes > Automatización de pedidos > "solicitar a los clientes que
confirmen los pedidos"**: esa opcion es para carritos y borradores de Pancake y Shopify, no
para pedidos normales.

## Paso 4. La prueba (la hace el usuario)

Con su **WhatsApp personal**, no el de la tienda:

> "Ahora la prueba. Crea un pedido de prueba a tu nombre, con tu numero personal completo
> (con el codigo del pais), un producto cualquiera y una direccion. En menos de un par de
> minutos te deberia llegar el WhatsApp de confirmacion con esos datos. Cuentame que ves."

Si sus pedidos llegan de una tienda (Shopify, Webcake...), tambien puede hacer el pedido de
prueba desde ahi: es la prueba mas real. Si lo crea en el POS: **Pedidos** > crear pedido,
y lo guias leyendo la pantalla.

Cuando le llegue:

1. Que toque **«Sí, confirmar»**. Le tiene que llegar el mensaje de gracias. Comprueba las
   marcas:

   ```bash
   mibot respuestas "<su nombre>"
   ```

   Tiene que salir `Confirmado`, y ya no `Pedido nuevo` ni `R1`.
2. Recomendado: un segundo pedido de prueba y esta vez **«Modificar datos»**. Le llega el
   mensaje de modificar y queda con `Asesor`. Si tiene encendido el bot que conversa, con
   esa marca el bot deja de contestarle: que se la quite despues en la bandeja de Pancake.
3. Opcional: un tercer pedido sin tocar nada. A las 2 horas (dentro del horario) le llega
   el recordatorio, y al dia siguiente queda con `Sin respuesta`. Se revisa en la proxima
   sesion con `mibot respuestas`.

Al terminar, que **cancele los pedidos de prueba en el POS** (cancelar, no borrar) para que
nadie los despache.

```bash
mibot verificar-confirmacion --encendido
```

Todo `OK`, con los tres pasos encendidos. Guarda `mi-confirmacion.json`
(`encendido.probado: true`).

**Si algo no llega:**

| Lo que pasa | Lo primero que se revisa |
|---|---|
| No llega ningun WhatsApp | El origen del pedido de prueba esta marcado en la regla; la regla esta encendida; el pedido tiene el telefono con codigo de pais; el saldo; `mibot verificar-confirmacion --encendido` |
| Llega con huecos ("Hola , ...") | Ese dato falta en el pedido del POS |
| Toca el boton y no pasa nada | Los flujos de respuesta estan publicados (`mibot verificar-confirmacion`) |
| Las marcas no cambian | `mibot verificar-confirmacion`; si dice que todo esta bien, reportalo |

Si algo sale mal y no se resuelve en el momento: `mibot apagar-confirmacion` antes de
seguir buscando. Los pedidos de sus clientes siguen entrando mientras tanto.

---

## Lo que le entregas al cerrar

Un resumen corto en el chat:

- **Que quedo:** la confirmacion al entrar el pedido, el recordatorio a las 2 horas, la
  marca «Sin respuesta» al dia, y los dos botones.
- **Como lo usa su equipo**, en la bandeja de Pancake, filtrando por etiqueta:
  - `Confirmado`: se puede despachar.
  - `Asesor`: pidio cambiar algo; hay que escribirle.
  - `Sin respuesta`: no contesto en un dia; hay que llamarlo antes de despachar.
- **Si el cliente contesta escribiendo** ("si", "ok") en vez de tocar el boton, el sistema
  no lo toma como confirmacion: le llega el recordatorio y al dia queda en `Sin respuesta`.
  Por eso esa lista se revisa todos los dias. Si ademas tiene encendido el bot que
  conversa, el bot puede contestarle sin saber nada del pedido.
- **Como apagarlo si algo sale mal**, para que lo haga solo:

  > En Botcake > Secuencias > «Confirmación de pedidos»: apagar el interruptor «Activar»
  > de cada paso. Deja de enviar al instante. Si ademas quiere que no entren pedidos
  > nuevos a la secuencia, en el POS > Ajustes > Notificación, apagar la regla
  > «Confirmación de pedidos».

  O abrir Claude Code en la misma carpeta y pedir que lo apague (`mibot apagar-confirmacion`).
- **Que revisar cada semana:** el saldo de la cuenta prepago (sin saldo no sale ningun
  mensaje y nadie avisa) y cuantos quedan en `Sin respuesta` (si son casi todos, los
  mensajes no estan llegando).
- **Cambiar un texto:** los de gracias y modificar se cambian en Botcake (abrir el flujo,
  editar el texto, **Actualizar**); que abra Claude Code en la misma carpeta y te lo pida.
  Cambiar una plantilla ya aprobada es otra revision de Meta y rehacer el paso: este
  recorrido todavia no lo hace; que lo reporte a quien le entrego el plugin.
