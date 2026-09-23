# Los textos: seis publicos y cinco privados

Son lo unico que el usuario revisa. Todo lo demas es mecanico. Escribelos bien, enseñaselos
y no montes nada hasta que diga que si.

---

## La regla que mas vale: no asumir que quiere

Cuando alguien comenta, no sabemos que necesita. Si el texto dice "tenemos baterias,
paneles y cargadores", le habla de lo que no pregunto y se siente robotico. Por eso:

- ❌ Listar productos, lineas o tipos: "camisas, pantalones y zapatos", "el modelo ideal
  entre nuestras motos, bicimotos y patinetas".
- ✅ Una frase de ayuda general: "Con gusto te asesoramos para que encuentres la opcion
  ideal para ti", "Cuentanos que tienes en mente y te ayudamos".

El rubro general si se puede nombrar ("ropa deportiva", "equipos de audio"), porque quien
comenta ya esta ahi. Los tipos, no.

**Sin raya (—) ni punto medio (·) en ningun texto**: son marcas de texto hecho a maquina.
Con punto, coma o dos puntos alcanza. Los emojis si van, dos o tres por texto.

---

## Facebook e Instagram no son iguales

| | Facebook | Instagram |
|---|---|---|
| Respuesta publica | Lleva el enlace `wa.me/...`, que se puede pulsar | **Sin enlace**: en Instagram los enlaces de los comentarios no se pueden pulsar. Va el numero escrito, en grupos de tres (ej. "300 123 4567") |
| Mensaje privado, version 5 | El enlace va dentro del texto | Lleva un **boton "Ir a WhatsApp"** (se monta en la Fase 3) |
| Me gusta automatico al responder | Si | No existe |

El enlace de WhatsApp se arma asi: `https://wa.me/` + codigo del pais + numero, todo
pegado y sin el signo mas. Para Colombia, un numero 300 123 4567 queda
`https://wa.me/573001234567`. La forma legible para Instagram es "300 123 4567".

⚠️ **Un riesgo que hay que decirle al usuario:** Facebook a veces marca como spam las
respuestas publicas que llevan enlaces. Muchas cuentas lo usan sin problema, pero si un
dia le empiezan a ocultar o borrar respuestas, el primer ajuste es quitar el enlace del
texto publico y dejar solo "escribenos por WhatsApp". Preguntale si quiere el enlace
(recomendado) y anota su decision en `mis-comentarios.json` (`textos.enlace_en_facebook`).

---

## La formula de cada texto

1. **Apertura:** saludo mas gracias por comentar ("¡Gracias por escribirnos!", "¡Que gusto
   leerte!").
2. **El nombre:** `{{user_full_name}}` tal cual, solo en los **publicos**. Botcake lo cambia
   por el nombre de la persona. En los privados no va.
3. **Una frase de ayuda general** (sin productos).
4. **Una sola llamada a WhatsApp:** el enlace en Facebook, el numero en Instagram.
5. **Dos o tres emojis** de la marca, los mismos en todos.

Seis textos publicos distintos y cinco privados distintos: asi cada persona ve uno
diferente y no parece automatico.

---

## Plantilla de los seis publicos

Cambia `[Marca]`, `[emoji]` y `[WhatsApp]` (`wa.me/...` en Facebook; el numero escrito en
Instagram). Ajusta el trato (tu o usted) al de la marca.

1. `¡Gracias por escribirnos, {{user_full_name}}! [emoji] Con gusto te contamos todo y te asesoramos por WhatsApp 👉 [WhatsApp]`
2. `¡Hola {{user_full_name}}! 😊 La informacion de disponibilidad y envios te la damos directo por WhatsApp: [WhatsApp] [emoji]`
3. `¡Mil gracias por tu mensaje, {{user_full_name}}! ⭐ Con gusto te asesoramos para que encuentres la opcion ideal para ti. Escribenos y te contamos todo 👉 [WhatsApp]`
4. `¡Que gusto leerte, {{user_full_name}}! 😊 Toda la asesoria te la damos por WhatsApp: [WhatsApp] [emoji]`
5. `¡Gracias por interesarte en [Marca], {{user_full_name}}! [emoji] Hablemos por WhatsApp 👉 [WhatsApp] ⭐`
6. `¡Hola {{user_full_name}}! [emoji] Con gusto te ayudamos a encontrar justo lo que necesitas. Escribenos por WhatsApp: [WhatsApp] 😊`

En Instagram, en vez de "👉 [enlace]" se escribe "al [numero]" o "escribenos al [numero]".

## Plantilla de los cinco privados

Sin `{{user_full_name}}`. La quinta es la de "da clic": en Instagram lleva el boton "Ir a
WhatsApp" y el texto termina sin enlace; en Facebook el enlace va al final del texto.

1. `¡Hola! [emoji] Gracias por comentar en nuestra publicacion. En [Marca] [una frase con lo que hace la marca, sin listar productos]. Con gusto te asesoramos para que encuentres la opcion ideal para ti. Escribenos por WhatsApp aqui 👉 [enlace] ¡Te esperamos! 😊`
2. `¡Hola! 😊 Que gusto tu interes en [Marca]. Cuentanos por WhatsApp que tienes en mente y te asesoramos con la mejor opcion para ti 👉 [enlace] [emoji]`
3. `¡Hola! [emoji] Gracias por escribirnos. La informacion de disponibilidad y envios te la damos por WhatsApp, asi te atendemos mas rapido 👉 [enlace]`
4. `¡Hola! ⭐ Nos encanta que te intereses en [Marca]. Escribenos por WhatsApp y una persona del equipo te ayuda a elegir 👉 [enlace] [emoji]`
5. Instagram (con boton): `¡Hola! [emoji] Gracias por comentar. Para contarte todo y ayudarte, da clic y escribenos por WhatsApp 👉 😊`
   Facebook (sin boton): el mismo texto con el enlace al final en vez del "👉".

Si la marca tiene envios a todo el pais, "con envio a todo el pais" cabe en el primero.
Si no los tiene, no lo digas.

---

## Ejemplo completo, con una marca inventada

Marca: **Huerto Sol**, plantas y macetas, Bogota, trato de tu, emojis 🌱🪴✨, WhatsApp
`https://wa.me/573001234567` (legible: 300 123 4567).

Publico de Facebook, texto 3:

> ¡Mil gracias por tu mensaje, {{user_full_name}}! ✨ Con gusto te asesoramos para que
> encuentres la opcion ideal para tu espacio. Escribenos y te contamos todo 👉
> https://wa.me/573001234567

El mismo, en Instagram:

> ¡Mil gracias por tu mensaje, {{user_full_name}}! ✨ Con gusto te asesoramos para que
> encuentres la opcion ideal para tu espacio. Escribenos al 300 123 4567 y te contamos
> todo. 🌱

Privado, version 1:

> ¡Hola! 🌱 Gracias por comentar en nuestra publicacion. En Huerto Sol te ayudamos a
> llenar tu casa de verde. Con gusto te asesoramos para que encuentres la opcion ideal
> para ti, con envio a toda Bogota. Escribenos por WhatsApp aqui 👉
> https://wa.me/573001234567 ¡Te esperamos! 😊

---

## Las palabras que se ocultan

Los comentarios que traen estas once palabras se ocultan, y ademas se bloquea a quien las
escribe y se elimina el comentario:

`robo, estafa, lucrar, lucran, lucra, robar, roban, estafan, estafar, asalto, asaltar`

Preguntale al usuario si en su pais o rubro hay otras que quiera sumar (por ejemplo
insultos locales). Se guardan en `mis-comentarios.json` (`textos.palabras_a_ocultar`).

---

## Antes de dar los textos por buenos

1. Ningun texto lista productos ni tipos.
2. Los seis publicos llevan `{{user_full_name}}` escrito tal cual; los privados no.
3. Facebook con enlace (si el usuario lo acepto); Instagram con el numero escrito.
4. Los seis publicos son distintos entre si, y los cinco privados tambien.
5. Sin rayas ni puntos medios.
6. El usuario los vio todos y dijo que si.
