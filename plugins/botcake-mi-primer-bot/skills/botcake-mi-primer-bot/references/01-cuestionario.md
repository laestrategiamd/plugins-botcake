# El cuestionario

Las preguntas que convierten un negocio en un bot.

## Como se hacen

- **De a una o de a tres, nunca las 35 de golpe.** Un formulario largo hace que la gente
  conteste corto y mal.
- **Cada respuesta se guarda en `mi-bot.json` en cuanto la tienes.** No al final del bloque.
- **Si no sabe, se marca PENDIENTE y se sigue.** No lo dejes atascado en una pregunta.
- **Si contesta algo vago, repregunta una vez.** "Vendemos ropa" no sirve; "vendemos ropa
  deportiva de mujer, tallas S a XL, entre 80.000 y 200.000 pesos" si sirve.

Las preguntas marcadas con ★ son las del **camino rapido** (12 preguntas). Las demas solo
en el camino completo.

---

## Bloque A — Diagnostico (siempre, las cuatro)

1. ★ **Cuentame en dos o tres frases: que vende tu negocio y a quien.**
2. ★ **Hoy, cuando alguien te escribe por WhatsApp o redes, quien contesta y en cuanto
   tiempo?**
3. ★ **Que es lo que mas te desgasta de esa atencion?** (Ejemplos que le puedes dar para
   que se ubique: contestar lo mismo veinte veces, perder mensajes de noche, que se te
   caigan clientes por demorarte.)
4. **Cuantos mensajes nuevos te llegan al dia, mas o menos?** Sirve para saber si el bot va
   a atender 5 conversaciones o 500.

> Con estas cuatro eliges el rubro en `02-plantillas-rubro.md` y le ofreces camino rapido o
> completo.

---

## Bloque B — Identidad del negocio

5. ★ **Como se llama el negocio, exactamente como quieres que lo escriba el bot?**
6. **En que ciudad y pais estas?** (Define moneda, forma de hablar y horario.)
7. **Tienes local fisico? Si si, direccion y horario de atencion presencial.**
8. **Que dias y en que horario atiende tu equipo los mensajes?**
9. **Que pasa fuera de ese horario hoy?** (Nadie contesta, contesta alguien igual, hay un
   mensaje automatico.)

---

## Bloque C — Lo que vende

10. ★ **Listame lo que vendes.** Si son pocos productos, todos con nombre y precio. Si son
    muchos, las lineas o categorias y el rango de precios.
11. ★ **Cual es el producto o servicio que mas vendes?**
12. **Hay algo que la gente pregunte mucho y no vendas?** (Para que el bot sepa decir que no
    lo tiene, en vez de inventar.)
13. **Tienes promocion vigente? Hasta cuando?** (Ojo: las promociones vencen. Anota la fecha
    y avisale que hay que actualizarla ese dia.)
14. **Como se cotiza lo que vendes: precio fijo, por medida, por proyecto?**

> ⚠️ Si el negocio tiene el catalogo cargado en el POS de Pancake, **no copies los precios
> aqui**. Anotalo en `mi-bot.json` y en la Fase 5 se conecta el catalogo, que se mantiene
> solo. Copiar precios a mano garantiza que en dos meses el bot cotice mal.

---

## Bloque D — Entrega, pagos y garantias

15. ★ **Haces envios? A donde y en cuanto tiempo llegan?**
16. **Cuanto cuesta el envio? Hay envio gratis desde algun monto?**
17. ★ **Que formas de pago aceptas?** (Nombres exactos: transferencia, contra entrega,
    tarjeta, un link de pago.)
18. **Aceptas devoluciones o cambios? En cuantos dias y con que condiciones?**
19. **Tienes garantia? De cuanto tiempo y que cubre?**

---

## Bloque E — Que tiene que lograr el bot

20. ★ **Que quieres que haga el bot, en una frase?** Ayudalo con estas opciones y que elija
    una o dos, no cinco:

    | Objetivo | Que hace el bot |
    |----------|-----------------|
    | Vender | Presenta producto, resuelve dudas, cierra o pasa a un asesor |
    | Agendar | Consigue los datos y agenda una cita o una llamada |
    | Filtrar | Averigua si la persona sirve como cliente y clasifica |
    | Resolver dudas | Contesta preguntas frecuentes y descarga al equipo |
    | Post-venta | Estado del pedido, garantias, reclamos |

21. **Como sabrias, en un mes, que el bot te sirvio?** (Respuesta concreta: "que no me
    escriban de noche", "que me lleguen 10 citas por semana".)

---

## Bloque F — Los limites: que NO hace

Es el bloque que mas problemas evita. Insiste aunque el usuario diga "el bot que haga de
todo".

22. ★ **Que NO quieres que el bot haga nunca?**
23. **Puede dar descuentos? Si si, hasta cuanto y con que condicion?** (Si la respuesta es
    dudosa, la respuesta es no.)
24. **Puede prometer fechas de entrega?** (Casi siempre: no. Que diga el plazo general y que
    un asesor confirma.)
25. **Hay temas que no puede tocar?** (Salud, resultados garantizados, temas legales,
    comparaciones con la competencia.)

---

## Bloque G — Cuando entra una persona

26. ★ **En que casos quieres que el bot deje de contestar y te pase la conversacion?**
    Ejemplos para ofrecerle: cliente molesto, reclamo, pide hablar con alguien, quiere
    negociar precio, pregunta algo que el bot no sabe.
27. **Que le dice el bot al cliente cuando pasa a una persona?** (Importante: no prometer un
    tiempo que no se cumple. "En un momento te escribe alguien del equipo" es mejor que "en
    5 minutos".)
28. **Y si eso pasa fuera del horario de atencion?**

---

## Bloque H — Datos a pedir y forma de hablar

29. ★ **Que datos necesitas de cada persona que escribe?** (Nombre, ciudad, telefono,
    producto de interes, presupuesto.) Pide los minimos: cada dato de mas cuesta clientes.
    Cada uno se guarda en `mi-bot.json` como `{"campo": "Ciudad", "instruccion": "..."}`:
    el nombre corto de la casilla y una instruccion de maximo 200 caracteres que diga que
    es el dato, como lo suele decir el cliente, en que formato se anota y "si no lo dijo,
    vacio". Esa instruccion es la que usa el bot para anotarlo solo (paso 8 del montaje).
30. ★ **De usted o de tu?**
31. **Emojis: si, pocos, o ninguno?**
32. **Mensajes cortos o explicados?** (En WhatsApp, cortos casi siempre.)
33. **Hay palabras que uses siempre o que no quieras que use?**
34. **Quieres que el bot tenga nombre propio?** (Ejemplo: "Hola, soy Ana del equipo de...")
35. **Pasame un ejemplo de una conversacion tuya que salio bien.** Vale una captura o un
    copiar y pegar. Es la fuente mas util de todo el cuestionario: de ahi sale el tono real.

---

## Al cerrar

Antes de pasar a la Fase 4, le lees un resumen de lo que entendiste —negocio, que vende,
que hace el bot, que no hace, cuando pasa a una persona— y le pides que corrija. Es mas
barato corregir aqui que en el prompt.

Y le enseñas la lista de PENDIENTES: *"estos datos me faltan; el bot va a decir que un
asesor los confirma hasta que me los pases"*.
