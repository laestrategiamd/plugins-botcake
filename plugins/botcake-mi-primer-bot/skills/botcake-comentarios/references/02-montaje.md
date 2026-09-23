# Fase 3: el montaje en Botcake

Todo se hace con el navegador automatizado del plugin, sobre la sesion del usuario. Tu
haces los clics; el usuario solo inicia sesion. Se monta **una cuenta a la vez**: primero
Facebook o Instagram, la que el usuario prefiera, y la otra en la siguiente tanda.

> 🔴 **Despues de cada pantalla, compruebas.** Botcake muestra cosas como guardadas antes
> de guardarlas. Nunca digas "listo" sin haber vuelto a mirar la pantalla.

**Como se navega:** en cada pantalla, busca el elemento por el texto que lleva (boton,
pestaña, casilla), haz clic, y vuelve a mirar la pantalla antes del siguiente clic. Las
referencias a elementos cambian cada vez que la pantalla cambia: no reutilices una vieja.
Evita las fotos de pantalla: gastan mucho. Usa la lectura de la pantalla como texto, y
las fotos solo cuando el usuario tenga que ver algo.

---

## Paso 1. Entrar `[el usuario inicia sesion]`

1. Abre `https://botcake.io` en el navegador automatizado.
2. Dile: *"Se abrio Botcake. Inicia sesion tu ahi, con Facebook o con tu cuenta de
   Pancake. Yo no veo ni necesito la contrasena. Cuando veas tu pagina, escribeme
   listo."*
3. Cuando confirme, entra a la pagina o cuenta que se va a montar. **Comprueba el nombre
   de la marca** en la barra lateral antes de tocar nada: es facil quedar en otra cuenta.
   Las cuentas de Instagram tienen un identificador que empieza por `igo_`; las de
   Facebook, un numero. Anota el identificador en `mis-comentarios.json`
   (`cuentas.<red>.identificador`): sale en la direccion de la pantalla,
   `botcake.io/<identificador>/...`.

Si al entrar aparece un aviso de Meta que tapa la pantalla, cierralo (la X o la tecla
Escape) antes de seguir; si no, los clics no llegan.

---

## Paso 2. El mensaje privado con sus cinco versiones

Es un flujo, o sea un pequeño camino de pasos que Botcake ejecuta. Su primer paso es un
**aleatorizador**: un reparto al azar entre las cinco versiones del mensaje.

1. Ve a `botcake.io/<identificador>/flows`.
2. **Añadir nuevo** > **Nuevo flujo** > nombre `DM Facebook` (o `DM Instagram`) >
   **Confirmar**. Se abre el editor.
3. En "Elegir primer paso" elige **Aleatorizador**.
4. Vienen dos variaciones. Pulsa **Nueva variacion** tres veces, hasta tener cinco.
   Compruebalo contando las casillas de porcentaje: tienen que ser cinco.
5. Escribe `20` en cada casilla de porcentaje. El total tiene que decir `100%`.
6. Conecta cada opcion (A, B, C, D, E) a un mensaje:
   - En la opcion, **Elegir el siguiente paso** > **Seleccionar mensaje**.
   - La opcion A crea el mensaje sola (aparece como `Flujo #2`).
   - Las opciones B a E abren una ventana "Seleccionar mensaje": pulsa **Crear nuevo**,
     aparece un `Flujo #N` nuevo en la lista, **haz clic sobre ese `Flujo #N`** y
     **Confirmar**.
7. Escribe cada mensaje: en "Pasos adjuntos" haz clic en el paso (`Flujo #N`), pulsa el
   lapiz (**Cambiar nombre**) y ponle `DM FB 01` a `DM FB 05` (o `DM IG 0N`), Enter. Haz
   clic en el cuadro del mensaje (dice `0/1200`) y escribe el texto aprobado. Para volver
   a las opciones, haz clic en el paso inicial `Aleatorizador #1`.
8. **Solo en Instagram, en `DM IG 05`:** el boton "Ir a WhatsApp".
   - **Agregar boton** > aparece "Boton #1" > haz clic en "Boton #1".
   - En la ventanita "Editar boton": titulo `Ir a WhatsApp` > **Abrir sitio web** > en la
     casilla de la direccion escribe `https://wa.me/<pais><numero>` > **Guardar** (el de
     la ventanita, no el del flujo). Si ese Guardar no responde al clic, este codigo lo
     pulsa por dentro de la pagina:
     ```js
     () => { const tip = [...document.querySelectorAll('[role="tooltip"]')].find(t => t.textContent.includes('Editar botón')); const b = [...tip.querySelectorAll('button')].find(x => x.textContent.trim() === 'Guardar'); b.click(); }
     ```
9. Guarda el flujo con el boton del encabezado: dice **Guardar** si es nuevo y
   **Actualizar** si ya existia. Los dos guardan.
10. **Comprueba:** recarga la pagina del flujo y cuenta que siguen los cinco pasos con su
    texto. Anota el nombre del flujo en `mis-comentarios.json` (`cuentas.<red>.flujo_privado`).

---

## Paso 3. Las seis respuestas publicas

1. Ve a `botcake.io/<identificador>/comment`, pestaña **Comentarios**.
2. Enciende los interruptores **Respuesta automatica a comentarios** y **Bandeja de
   entrada automatica**. Si la pantalla dice "Has desactivado la respuesta automatica",
   es que el primero esta apagado: enciendelo y aparece el panel.
3. En "Comentarios predeterminados": el primero con **Crear nuevo**; los otros cinco con
   **Añadir nuevo** (aparece despues de guardar el primero).
4. En la ventana, escribe el texto en el cuadro "Responder comentario nivel 1". Al
   teclear `{{user_full_name}}` tal cual, Botcake lo convierte en una pastilla con el
   nombre. Comprueba que la pastilla quedo dentro del texto. **Guardar**.
5. **Comprueba:** al terminar tienen que verse seis tarjetas, cada una con su texto y su
   pastilla de nombre.

Para corregir un texto ya guardado: el boton que se ve en la tarjeta es **Eliminar**, no
editar. Para editar, haz clic **sobre el texto** de la tarjeta: se abre "Editar respuesta
al comentario". Dentro, clic en el cuadro, seleccionar todo (Ctrl+A o Cmd+A), borrar,
escribir el nuevo (la pastilla se vuelve a formar) y **Guardar**.

---

## Paso 4. Enlazar el mensaje privado

1. Pestaña **Bandeja de entrada** > fila "Contenido de la bandeja de entrada del
   comentario".
2. La fila tiene dos botones sin nombre. **El segundo** (el icono de enlazar) abre la
   ventana "Elegir un mensaje" para escoger un flujo que ya existe. El primero abre un
   editor distinto ("Private Replies"): si lo abres por error, **Cancelar**.
3. En "Elegir un mensaje", marca `DM Facebook` (o `DM Instagram`) > **Confirmar**. Se
   abre una vista del flujo > **Guardar**.
4. **Comprueba:** la fila tiene que mostrar el nombre del flujo enlazado.

---

## Paso 5. La moderacion

Pestaña **Otras configuraciones**.

**General:** solo en Facebook, enciende "Me gusta automatico en comentarios despues de que
Botcake responda". Instagram no tiene esa opcion. Lo de "Transmision en vivo" y "grupo",
si aparece, se deja apagado.

**Ocultar comentarios:**

1. Enciende **Comentarios con numero de telefono**.
2. Enciende **Comentarios contienen palabra clave**. Aparece una casilla para escribir:
   teclea cada palabra de la lista aprobada y pulsa Enter despues de cada una (once, o las
   que haya en `mis-comentarios.json`). Enciende **Bloquear usuario que comenta la palabra
   clave** y **Eliminar comentario que incumple las normas**.
3. Enciende **Comentarios contienen enlace** y deja marcado "Todos los enlaces".
4. "Ocultar todos los comentarios" y "Comentarios con imagenes, video, sticker o GIF" se
   quedan apagados.

**Comprueba:** vuelve a leer la pantalla y confirma los interruptores encendidos y las
palabras cargadas.

---

## Paso 6. Guardar sin encender

Aqui termina la Fase 3. Guarda `mis-comentarios.json` (`cuentas.<red>.montado: true`).
**No pulses "Guardar y activar" todavia**: ese boton pone a responder a clientes reales y
va en la Fase 4, con el "si" del usuario.

---

## Opcional: que responda el bot del primer recorrido

Si el usuario ya monto su agente de inteligencia artificial con la skill hermana, Botcake
puede usarlo para responder los comentarios en vez de los seis textos fijos: en la
pantalla de comentarios, **Configuracion general** > **Configuracion automatica** >
activar **IA** > elegir el agente > Guardar. Si la IA falla, responde uno de los seis
textos. Ofrecelo solo si lo pide; consume saldo de Botcake AI como cualquier respuesta del
agente.

Y un aviso: si una publicacion tiene activo "Solo responder por publicacion", esta
configuracion general **no aplica a esa publicacion**. Si un dia un post no responde, eso
es lo primero que se revisa.
