---
name: botcake-comentarios
description: >
  Monta, de principio a fin, las respuestas automaticas a los comentarios de una pagina de
  Facebook o una cuenta de Instagram en Botcake (ecosistema Pancake): una respuesta publica
  que rota entre seis textos, un mensaje privado a quien comenta con cinco variantes al
  azar, y la moderacion que oculta comentarios con telefonos, enlaces o insultos. Usala
  cuando el usuario diga "responder comentarios automaticamente", "comentarios de
  Facebook", "comentarios de Instagram", "que me escriban al WhatsApp desde los
  comentarios", "mensaje automatico a quien comenta", "ocultar comentarios con telefono",
  "automatizar los comentarios", "sigamos con mis comentarios" o "retomar mis comentarios".
  Si lo que quiere es un bot que conversa por WhatsApp, eso es la skill hermana
  botcake-mi-primer-bot.
---

# Respuestas automaticas a comentarios

Esta skill deja una pagina de Facebook o una cuenta de Instagram contestando sola a cada
persona que comenta una publicacion, y llevandola a WhatsApp. Es el segundo recorrido del
plugin; el primero es el bot que conversa (`botcake-mi-primer-bot`).

**Hablas siempre en espanol, sencillo y directo.** Quien te lee no sabe que es un flujo ni
un aleatorizador. No uses esas palabras sin explicarlas en la misma frase. No des por
sabido nada de lo que pasa mientras trabajas: si abriste una pantalla o leiste algo,
ensenaselo.

---

## Que queda montado, explicado para el usuario

> Cuando alguien comenta una publicacion tuya, pasan tres cosas solas:
>
> 1. **Le respondes en publico** debajo de su comentario, con su nombre, invitandolo a
>    escribirte por WhatsApp. Hay seis respuestas distintas que se van turnando, para que
>    no se vea que es automatico.
> 2. **Le llega un mensaje privado** con el enlace a tu WhatsApp. Hay cinco versiones y
>    se elige una al azar.
> 3. **Se ocultan los comentarios que te hacen dano**: los que traen un numero de telefono
>    (para que la competencia no se lleve a tu cliente), los que traen enlaces y los que
>    traen insultos o palabras como "estafa".

---

## Las tres reglas que no se rompen nunca

**1. Los textos los aprueba el usuario antes de montar nada.** Son lo unico que revisa; el
resto es mecanico. No montes con textos que no haya visto.

**2. Los textos no nombran productos.** Cuando alguien comenta no sabemos que quiere.
Un texto que dice "tenemos camisas, pantalones y zapatos" le habla de lo que no pregunto
y se siente robotico. La unica meta del texto es llevar a la persona a WhatsApp. Se puede
nombrar el rubro general ("ropa deportiva"), nunca la lista.

**3. No se enciende sin un "si" explicito.** El boton "Guardar y activar" pone a responder
a clientes reales. Se monta todo, se le ensena, y se enciende solo cuando el usuario lo
autorice con palabras.

---

## Lo que necesita (requisitos)

Preguntalo todo de una vez, en una sola lista:

1. **Una pagina de Facebook o una cuenta profesional de Instagram conectada en Botcake.**
   Se comprueba entrando a `botcake.io`: la pagina o la cuenta tiene que aparecer en su
   lista. Si no esta conectada, la guia de arranque de la skill hermana
   (`../botcake-mi-primer-bot/references/00b-arranque-desde-cero.md`, bloques 3 y 4) le dice
   como; el usuario hace todos los clics. Una cuenta de Instagram personal no sirve: tiene
   que ser profesional (se cambia gratis desde el telefono).
2. **Un numero de WhatsApp donde recibir a la gente.** Sirve un WhatsApp normal o uno de
   empresa. Pide el numero completo con el codigo del pais (ej. 57 para Colombia).
3. **Node.js instalado** (para el navegador automatizado). Se comprueba con `node -v`; si
   falta, `nodejs.org`, version LTS, y reabrir la app de Claude.

No hace falta la billetera de Pancake ni saldo: este recorrido no usa inteligencia
artificial.

Si va a montar Facebook e Instagram, se hacen **uno despues del otro**, con sus propios
textos: en Instagram los enlaces no se pueden pulsar y los textos cambian.

---

## El archivo del proyecto: `mis-comentarios.json`

Es la memoria de este recorrido. Vive en la carpeta donde el usuario abrio Claude Code, al
lado de `mi-bot.json` si tambien hizo el bot.

Al empezar cualquier sesion: `ls mis-comentarios.json 2>/dev/null && cat mis-comentarios.json`.
Si existe, sigues donde quedo. Si no, lo creas desde `plantilla-comentarios.json`.
Se actualiza al cerrar cada fase.

---

## Como se trabaja: por tandas

| Tanda | Fases | Que sale de aqui |
|-------|-------|------------------|
| 1 | 0, 1, 2 | Requisitos en verde, datos de la marca y los textos aprobados |
| 2 | 3, 4 | La primera cuenta (Facebook o Instagram) montada, encendida y probada |
| 3 | 3, 4 otra vez | La segunda cuenta, si hay |

Al cerrar cada tanda: guardas `mis-comentarios.json` y dices: *"Hasta aqui llega esta
tanda. Cuando quieras seguir, abre una conversacion nueva y escribe **sigamos con mis
comentarios**."* No sigues sin que lo pida.

---

## Las cinco fases

### Fase 0. Requisitos

La lista de arriba. Si falta algo, no avanzas; ofrecele acompanarlo.

### Fase 1. Datos de la marca

Cuatro preguntas:

1. **Como se llama la marca**, exactamente como quiere que aparezca.
2. **Que vende, en una frase general** (para el rubro, no para la lista de productos).
3. **El numero de WhatsApp** con codigo de pais.
4. **Tono y emojis:** de tu o de usted, y dos o tres emojis que vayan con la marca. Si no
   sabe, propones segun el rubro (una tienda de deporte: ⚡🏃; una pasteleria: 🎂✨).

Guarda todo en `mis-comentarios.json`.

### Fase 2. Los textos

**Abre:** `references/01-copys.md`

Escribes los seis textos publicos de Facebook, los seis de Instagram (si aplica) y las
cinco versiones del mensaje privado, siguiendo la formula de la referencia. Se los
ensenas todos en el chat y **esperas su aprobacion**. Lo que quiera cambiar, lo cambias
y se lo vuelves a ensenar. Los textos aprobados van a `mis-comentarios.json`.

**Cierra la tanda 1 aqui.**

### Fase 3. Montaje en Botcake

**Abre:** `references/02-montaje.md`

Con el navegador automatizado del plugin, el usuario inicia sesion en Botcake (tu no le
pides contrasenas), y tu haces los clics: creas el mensaje privado con sus cinco
versiones, cargas los seis textos publicos, enlazas el mensaje privado, y dejas la
moderacion configurada. **Despues de cada pantalla compruebas** que quedo guardado.

Al final de la Fase 3 todo esta montado y **sin encender**.

### Fase 4. Encender y probar

**Abre:** `references/03-prueba.md`

Le pides el "si" para encender, pulsas "Guardar y activar", recargas la pantalla y
compruebas que quedo encendido. Despues el usuario prueba desde su cuenta personal:
comenta en una publicacion suya y mira la respuesta publica, el mensaje privado y que un
comentario con un telefono se oculte.

Cierras con el resumen de lo montado y como apagarlo.

---

## Si algo se rompe

Un clic que no responde, una pantalla distinta a la de la guia, o un boton que no
aparece: no insistas mas de dos veces. Pasas a **decirle al usuario donde hacer el clic
el mismo**, mirando la pantalla juntos (`references/02-montaje.md` describe cada pantalla
con las palabras que aparecen en ella). Nunca lo dejas a medias y sin salida. Si Botcake
cambio algo, pidele que lo reporte a quien le entrego el plugin, con la fecha y lo que
salio en pantalla.

---

## Lo que esta skill NO hace

- No conecta la pagina ni la cuenta de Instagram por el usuario (lo acompana).
- No publica en sus redes ni comenta por el: la prueba la hace el desde su cuenta.
- No responde con inteligencia artificial. Si ya tiene el bot del primer recorrido,
  Botcake permite que ese agente responda los comentarios (`references/02-montaje.md`, al
  final), pero es un paso aparte y opcional.
