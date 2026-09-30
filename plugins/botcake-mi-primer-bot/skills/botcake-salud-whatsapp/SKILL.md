---
name: botcake-salud-whatsapp
description: >
  Revisa la salud de un numero de WhatsApp API ante Meta: por que bajo su calificacion de
  calidad, si esta en riesgo de restriccion o bloqueo, y que hacer para recuperarla o para
  que no pase. Lee lo que el usuario tiene montado en Botcake (plantillas, secuencias,
  difusiones, el bot) y entrega un diagnostico en lenguaje sencillo con un plan por orden.
  Usala cuando el usuario diga "mi WhatsApp tiene calidad baja", "Meta me mando una
  advertencia", "me van a bloquear el numero", "Meta restringio mi WhatsApp", "mis
  plantillas no salen", "limite de WhatsApp", "revisa que mi WhatsApp este bien", "revision
  de salud", "estoy mandando mucho spam?" o "sigamos con la revision de mi WhatsApp". Si lo
  que quiere es medir como atiende su equipo o su bot (tiempos, trato, ventas perdidas), no
  es esta skill.
---

# Revisar la salud de tu WhatsApp

Esta skill revisa si el numero de WhatsApp API del usuario esta sano ante Meta y, si no,
por que y que hacer. Es el cuarto recorrido del plugin. Los otros tres montan cosas (el bot
que conversa, las respuestas a comentarios y la confirmacion de pedidos); este **no monta
nada**: mira, explica y propone.

**Hablas siempre en espanol, sencillo y directo.** Quien te lee no sabe que es una
calificacion de calidad ni una plantilla de marketing. No uses esas palabras sin explicarlas
en la misma frase. No des por sabido nada de lo que pasa mientras trabajas: si leiste algo
en una pantalla o un comando respondio algo, ensenaselo.

---

## Lo que tiene que entender el usuario, en dos frases

> Meta le pone una nota a tu numero de WhatsApp (verde, amarilla o roja) segun como reciben
> tus mensajes las personas: si te bloquean, te reportan o te ignoran, la nota baja. Con la
> nota en rojo Meta te deja escribirle primero a menos gente, y si sigue asi puede
> restringir o bloquear el numero.

---

## Las tres reglas que no se rompen nunca

**1. No inventas.** Lo que no se pudo ver ni medir se dice asi: *"esto no lo pude revisar"*.
Un diagnostico con datos inventados lleva a cambiar lo que no era.

**2. No cambias nada sin un "si".** Este recorrido solo mira. Cada arreglo se le propone, y
se hace con su permiso y por el camino que corresponda (el comando o el recorrido que monto
esa pieza). La unica prisa justificada: si algo esta mandando mensajes que danan el numero
ahora mismo, le propones apagarlo primero y revisar despues.

**3. Severidad honesta.** Si el numero esta en rojo y la causa es clara, se dice claro.
Pero sin alarmar con lo que no se pudo medir.

---

## Dos formas de revision

| Cuando | Como se trabaja |
|---|---|
| **Tiene un problema** (nota baja, aviso de Meta, plantillas que no salen, numero restringido) | Primero lo que le paso y desde cuando; despues la revision completa, buscando la causa |
| **Quiere prevenir** (va a encender algo, lo encendio hace poco, o revision de cada mes) | La revision completa, buscando lo que podria bajar la nota |

Las dos siguen los mismos pasos. En la primera, las preguntas del paso 2 pesan mas.

---

## El comando `mibot`

Las lecturas de Botcake pasan por el comando del plugin, desde la carpeta del proyecto del
usuario. Si la terminal dice que `mibot` no existe, se llama por su ruta:
`node "<carpeta base de esta skill>/../botcake-mi-primer-bot/scripts/mibot.cjs"`, entre
comillas. La llave de sesion es la misma de los otros recorridos (`.botcake-sesion`); si no
existe, se guarda con los pasos 1 a 4 de la Fase 6 de
`../botcake-mi-primer-bot/references/06-montaje.md`.

---

## Los pasos

### Paso 1. Que tiene montado

Busca en la carpeta del proyecto los archivos de los otros recorridos:
`ls mi-bot.json mis-comentarios.json mi-confirmacion.json 2>/dev/null`. Te dicen que monto
con el plugin. Pregunta tambien si tiene cosas montadas por fuera (otras secuencias,
difusiones, otra herramienta que mande WhatsApp).

### Paso 2. Lo que le paso (si vino con un problema)

Pregunta solo lo que falte, tres o cuatro cosas por mensaje:

1. Que vio exactamente: la nota bajo, un aviso de Meta (que te lo copie tal cual), mensajes
   que no salen ("no se puede enviar por limite de WhatsApp"), el numero restringido.
2. Desde cuando.
3. Que cambio antes de eso: encendio algo nuevo, mando una difusion, subio el volumen.
4. Cuantas conversaciones tiene por semana, mas o menos.

### Paso 3. La nota y el limite, en Meta

La nota del numero no se ve en Botcake. Guialo a mirarla el, en su navegador: **Meta Business
Suite** (`business.facebook.com`) > **Administrador de WhatsApp** > **Numeros de telefono**.
Ahi, en la fila de su numero: la **calificacion de calidad** (verde, amarilla o roja) y el
**limite de mensajes** (a cuantas personas distintas puede escribirle primero en 24 horas).
Pidele que te diga las dos, y si hay algun aviso arriba. Los nombres de esa pantalla los pone
Meta y pueden variar un poco: si no la encuentra, que te describa lo que ve.

### Paso 4. Lo que puedes revisar tu

**Abre:** `references/02-los-siete-puntos.md`

Con `mibot` y el navegador del plugin, sin que el usuario exporte nada:

- `mibot plantillas`: que plantillas tiene, en que estado y en que categoria.
- Si hizo la confirmacion de pedidos: `mibot verificar-confirmacion`.
- Las secuencias (`botcake.io/<pagina>/sequence`) y las difusiones
  (`botcake.io/<pagina>/broadcast`): leerlas como texto en el navegador del plugin, sin fotos
  de pantalla. Cuantas hay encendidas, cada cuanto mandan y a quien.
- Si tiene el bot que conversa: lo primero que contesta a un "Hola". Con su permiso (cuesta
  centavos del saldo de Botcake AI): `mibot preguntar <agente> "Hola"`. Si tiene un mensaje de
  bienvenida, que te lo copie.

Con eso revisas los siete puntos de la referencia, cada uno como bien, a mejorar, grave o
"no se pudo revisar".

### Paso 5. El diagnostico y el plan

**Abre:** `references/01-como-califica-meta.md` si hace falta explicarle algo de Meta.

Se lo das en el chat, en este orden y corto:

1. **Como esta:** la nota que vio en Meta y, en una frase, tu lectura (sano, hay que
   corregir, urgente).
2. **La causa mas probable**, conectando lo que encontraste con lo que le paso
   ("la difusion del martes le llego a 800 personas que nunca te habian escrito; al dia
   siguiente bajo la nota").
3. **Lo que encontraste en los siete puntos:** primero lo grave, despues lo que hay que
   mejorar, y en una linea lo que esta bien y lo que no se pudo revisar.
4. **Que hacer ya** (primeras 48 horas), **que hacer estas semanas** y **como saber si
   mejora**. Cada accion dice que se cambia, donde y por que, con el texto nuevo si toca
   reescribir algo. Nada de "mejorar el mensaje": "cambiar tu bienvenida de 180 palabras con
   precios por esta de tres lineas".

Guarda el resumen, con la fecha, al final de `mi-revision-whatsapp.md` en la carpeta del
proyecto (si no existe, lo creas). La proxima revision empieza leyendolo, para comparar.

### Paso 6. Los arreglos

Le preguntas cuales quiere hacer. Cada uno por su camino, con su "si":

| Arreglo | Por donde |
|---|---|
| Apagar la confirmacion de pedidos mientras se corrige | `mibot apagar-confirmacion` |
| El recordatorio de confirmacion le llega a quien ya confirmo | `mibot verificar-confirmacion` y la tabla de fallos de `../botcake-confirmacion/references/02-montaje.md` |
| Una plantilla que Meta paso a Marketing | Otra con otro nombre: `../botcake-confirmacion/references/01-textos.md` |
| Lo que contesta el bot que conversa (bienvenida larga, precios de entrada, varias preguntas juntas) | El prompt, con el recorrido del bot (`../botcake-mi-primer-bot`, Fase 5) |
| Una secuencia o una difusion montada por fuera del plugin | En Botcake, con el usuario: apagarla o espaciarla. Si no sabe quien la monto, primero apagarla |

---

## Si algo se rompe

Si un comando falla por la llave o la conexion, abre
`../botcake-mi-primer-bot/references/08-cuando-falla.md`. Si una pantalla no carga o cambio,
se lo dices y sigues con lo demas: una revision con un punto sin revisar sirve igual, si se
dice cual.

---

## Lo que esta skill NO hace

- No mide como atiende su equipo ni cuanto vende por WhatsApp: solo el riesgo ante Meta.
- No revisa conversaciones exportadas (por ahora); trabaja con lo que se ve en Botcake, lo que
  el usuario ve en Meta y lo que el usuario cuenta.
- No habla con Meta por el usuario ni pide revisiones en su nombre: le dice cuando y donde.
- No cambia nada sin su permiso.
