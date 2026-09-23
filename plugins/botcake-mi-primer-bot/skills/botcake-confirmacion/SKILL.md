---
name: botcake-confirmacion
description: >
  Monta, de principio a fin, la confirmacion automatica de pedidos por WhatsApp en Botcake
  (ecosistema Pancake): cuando entra un pedido al POS, el cliente recibe sus datos con dos
  botones ("Si, confirmar" y "Modificar datos"), un recordatorio si no responde, y queda
  marcado para el equipo si nunca contesta. Usala cuando el usuario diga "confirmar pedidos
  por WhatsApp", "bot de confirmacion", "confirmacion de pedidos", "que el cliente confirme
  su pedido", "recordatorio de pedido", "pedidos contra entrega", "me devuelven muchos
  pedidos", "sigamos con mi confirmacion" o "retomar la confirmacion de pedidos". Si lo que
  quiere es un bot que conversa, es la skill hermana botcake-mi-primer-bot; si son
  respuestas a comentarios, botcake-comentarios.
---

# Confirmacion de pedidos por WhatsApp

Esta skill deja una tienda confirmando sola cada pedido nuevo por WhatsApp. Es el tercer
recorrido del plugin; los otros dos son el bot que conversa (`botcake-mi-primer-bot`) y las
respuestas a comentarios (`botcake-comentarios`).

**Hablas siempre en espanol, sencillo y directo.** Quien te lee no sabe que es una
plantilla de Meta, una secuencia ni una etiqueta. No uses esas palabras sin explicarlas en
la misma frase. No des por sabido nada de lo que pasa mientras trabajas: si abriste una
pantalla o un comando respondio algo, ensenaselo.

---

## Que queda montado, explicado para el usuario

> Cuando entra un pedido nuevo a tu Pancake, pasa esto solo:
>
> 1. **Al cliente le llega un WhatsApp** con los datos de su pedido y dos botones: «Sí,
>    confirmar» y «Modificar datos».
> 2. **Si confirma**, recibe un mensaje de gracias y queda marcado «Confirmado»: tu equipo
>    sabe que ese se puede despachar.
> 3. **Si quiere cambiar algo**, recibe un mensaje de que alguien lo atiende y queda
>    marcado «Asesor» para que tu equipo le escriba.
> 4. **Si a las 2 horas no ha respondido**, le llega un recordatorio. Uno solo.
> 5. **Si al dia siguiente sigue sin responder**, queda marcado «Sin respuesta»: es la
>    lista de pedidos que alguien tiene que llamar antes de despachar.

---

## Las cuatro reglas que no se rompen nunca

**1. Si falta un requisito, no se empieza.** Este recorrido tiene un filtro de entrada
estricto (`references/00-requisitos.md`). Si falta uno, le explicas cual, por que hace
falta y como se consigue, y ahi paras. Montarlo a medias le cuesta dinero o le deja un
sistema que no manda nada sin avisar.

**2. Los textos los aprueba el usuario antes de mandarlos a Meta.** Meta revisa cada
plantilla y una vez enviada no se corrige: se manda otra con otro nombre.

**3. Nada se monta sin las dos plantillas aprobadas por Meta como Utilidad.** `mibot` no
deja montar si falta una o si Meta la paso a Marketing.

**4. Se monta APAGADO y se enciende solo con un "si" con palabras.** Encendido, cada
pedido nuevo le manda un mensaje real a un cliente real, cada mensaje cuesta, y los envios
afectan la calificacion del numero de WhatsApp ante Meta.

---

## El comando `mibot`

Lo que se hace sobre la cuenta pasa por el mismo comando del plugin, `mibot`, **desde la
carpeta del proyecto del usuario**. Si la terminal dice que `mibot` no existe, se llama por
su ruta: `node "<carpeta base de esta skill>/../botcake-mi-primer-bot/scripts/mibot.cjs"`,
entre comillas.

La llave de sesion es la misma del bot que conversa (`.botcake-sesion`). Si el usuario ya
hizo ese recorrido en esta carpeta, sirve; si no, se guarda con los pasos 1 a 4 de la
Fase 6 de `../botcake-mi-primer-bot/references/06-montaje.md`.

Los subcomandos de este recorrido:

| Comando | Que hace |
|---|---|
| `mibot plantillas` | Lista las plantillas de WhatsApp de la cuenta y dice en que estado estan las dos de este recorrido |
| `mibot crear-plantillas` | Manda a Meta las dos plantillas, con los textos aprobados |
| `mibot confirmacion --solo-ver` | Ensena lo que se va a montar, sin tocar Botcake |
| `mibot confirmacion` | Monta etiquetas, flujos de respuesta y la secuencia con sus 3 pasos, apagada |
| `mibot verificar-confirmacion` | Relee todo y dice paso por paso si quedo bien |
| `mibot encender-confirmacion` | Enciende los 3 pasos (solo con el "si" del usuario) |
| `mibot apagar-confirmacion` | Los apaga |

---

## El archivo del proyecto: `mi-confirmacion.json`

Es la memoria de este recorrido. Vive en la carpeta del proyecto, al lado de `mi-bot.json`
si tambien hizo el bot.

Al empezar cualquier sesion: `ls mi-confirmacion.json 2>/dev/null && cat mi-confirmacion.json`.
Si existe, sigues donde quedo. Si no, lo creas copiando `plantilla-confirmacion.json`.
Se actualiza al cerrar cada fase; `mibot` escribe ahi los numeros de lo que monta.

---

## Como se trabaja: por tandas

| Tanda | Fases | Que sale de aqui |
|-------|-------|------------------|
| 1 | 0, 1, 2 | Requisitos en verde, textos aprobados y las dos plantillas enviadas a Meta |
| 2 | 3 | (cuando Meta las aprueba) todo montado, apagado y revisado |
| 3 | 4 | Encendido, conectado al POS y probado con un pedido del propio usuario |

La tanda 1 termina siempre esperando a Meta, que tarda de minutos a 48 horas. Al cerrarla
dices: *"Ahora Meta revisa las dos plantillas. Cuando quieras, abre una conversacion nueva
y escribe **sigamos con mi confirmacion**: lo primero que hago es mirar si ya las
aprobaron."*

Al cerrar las otras: guardas `mi-confirmacion.json` y dices *"Hasta aqui llega esta tanda.
Cuando quieras seguir, abre una conversacion nueva y escribe **sigamos con mi
confirmacion**."* No sigues sin que lo pida.

---

## Las cinco fases

### Fase 0. El filtro de entrada

**Abre:** `references/00-requisitos.md`

Los cuatro del filtro: WhatsApp API conectado, pedidos que ya llegan al POS de Pancake,
saldo para enviar plantillas, y dos plantillas aprobadas por Meta. Las tres primeras se
comprueban aqui; las plantillas se escriben en la Fase 2 y se exigen antes del montaje.
Ademas hacen falta Node.js y la llave de sesion. Si falta algo, no avanzas.

### Fase 1. La marca y el pedido

Cinco preguntas, todas de una vez:

1. **Como se llama la marca**, como quiere que aparezca.
2. **De tu o de usted**, y si usa emojis (dos o tres que vayan con la marca, o ninguno).
3. **Cobra contra entrega?** Si cobra por adelantado, el monto del pedido no va en el
   mensaje (en el POS ese valor sale en cero). Ver `references/01-textos.md`.
4. **Cuanto tiempo espera para el recordatorio.** Por defecto 2 horas, y solo entre las 8
   de la manana y las 10 de la noche.
5. **Quien del equipo atiende** a los que tocan «Modificar datos» y a los «Sin respuesta».
   Tiene que existir esa persona: el sistema los marca, no los llama.

Guarda todo en `mi-confirmacion.json`.

### Fase 2. Los textos y las plantillas

**Abre:** `references/01-textos.md`

Escribes las dos plantillas (confirmacion y recordatorio) y los dos mensajes de respuesta
(gracias y modificar), con el tono de la marca y las reglas de Meta para que las apruebe
como Utilidad. Se los ensenas y **esperas su aprobacion**. Aprobados, los mandas a Meta con
`mibot crear-plantillas` y le ensenas lo que respondio.

**Cierra la tanda 1 aqui.**

### Fase 3. El montaje

**Abre:** `references/02-montaje.md`

`mibot plantillas` para ver si Meta ya las aprobo. Si si: `mibot confirmacion --solo-ver`
para ensenarle lo que se va a montar, `mibot respaldo`, `mibot confirmacion`, publicar los
dos flujos de respuesta con el navegador del plugin y `mibot verificar-confirmacion` hasta
que todo salga bien. Queda todo **apagado**.

**Cierra la tanda 2 aqui.**

### Fase 4. Encender, conectar el POS y probar

**Abre:** `references/03-encender.md`

Con el "si" del usuario: `mibot encender-confirmacion`, la regla del POS que manda cada
pedido nuevo a la secuencia, y una prueba con un pedido a su propio numero. Cierras con el
resumen y como apagarlo.

---

## Si algo se rompe

Un comando que responde distinto a la guia, una pantalla que cambio o un boton que no
aparece: no insistas mas de dos veces. Si el problema es la llave o la conexion, abre
`../botcake-mi-primer-bot/references/08-cuando-falla.md`. Si es una pantalla, pasas a
**decirle al usuario donde hacer el clic el mismo**, mirando la pantalla juntos. Nunca lo
dejas a medias y sin salida, y **nunca dejas los pasos encendidos si algo quedo mal**: se
apagan con `mibot apagar-confirmacion` antes de seguir buscando. Si Botcake cambio algo,
pidele que lo reporte a quien le entrego el plugin, con la fecha y lo que salio.

---

## Lo que esta skill NO hace

- No conecta el WhatsApp API ni la tienda al POS: si los pedidos no llegan a Pancake, este
  recorrido no es para ahora.
- No cambia el estado del pedido en el POS. El equipo ve quien confirmo por las marcas
  («Confirmado», «Asesor», «Sin respuesta») en la bandeja de Pancake.
- No manda avisos de envio ni de entrega; solo la confirmacion y su recordatorio.
- No manda mensajes de prueba a clientes: la prueba es con un pedido del propio usuario.
