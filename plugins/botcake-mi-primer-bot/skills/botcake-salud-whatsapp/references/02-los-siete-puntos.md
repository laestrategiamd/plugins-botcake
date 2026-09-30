# Los siete puntos de la revision

Cada punto dice que mirar, como se revisa sin conversaciones exportadas, cuando es grave y
que se recomienda. Cada uno termina en una de cuatro: **bien**, **a mejorar**, **grave** o
**no se pudo revisar**. Si un punto solo se puede estimar por lo que cuenta el usuario, se
dice asi en el diagnostico ("segun lo que me contaste...").

---

## 1. Lo primero que recibe quien escribe

**Que mirar:** la respuesta a un "Hola": largo, precios, enlaces de pago, metodos de pago,
pedir fotos o datos de entrada, varios enlaces, un muro de texto.

**Como se revisa:** si tiene el bot que conversa, `mibot preguntar <agente> "Hola"` (con su
permiso; cuesta centavos). Si tiene un mensaje de bienvenida, que te lo copie. Cuenta las
palabras.

| | Bien | A mejorar | Grave |
|---|---|---|---|
| Largo | Menos de 50 palabras | 50 a 100 | Mas de 100 |
| Precios | Ninguno | Mencion de pasada | Precios escritos |
| Enlaces de pago o metodos de pago | Ninguno | | Cualquiera |
| Pedir fotos o datos personales | Nada | | Cualquier pedido |
| Otros enlaces | Ninguno | Uno | Varios |

**Que recomendar:** tres lineas, sin nada comercial, y que termine en una pregunta. Ejemplo:

```
¡Hola! Bienvenida a Huerto Sol 🌱 ¿En qué te ayudo?
1. Ver plantas y macetas
2. Estado de mi pedido
3. Otra pregunta
```

Si es el bot que conversa, se cambia el prompt (recorrido del bot, Fase 5).

## 2. Gente que escribe una vez y no vuelve

**Que mirar:** cuantos escriben, reciben la primera respuesta y no contestan mas. Para Meta
es la senal mas clara de que el mensaje no se quiso.

**Como se revisa:** exacto no se puede sin exportar las conversaciones. Pidele que abra la
bandeja de Pancake, mire las ultimas 10 conversaciones que empezaron los clientes y cuente en
cuantas la persona no volvio a escribir despues de la primera respuesta.

| De cada 10 | Nivel |
|---|---|
| 2 o menos | Bien |
| 3 o 4 | A mejorar |
| 5 o 6 | Grave |
| 7 o mas | Urgente |

**Que recomendar:** casi siempre la causa es el punto 1. Despues, preguntas de una en una
(punto 7).

## 3. Seguimientos automaticos

**Que mirar:** mensajes que salen solos cuando la persona no contesta: cuanto tardan, cuantos
son y que dicen.

**Como se revisa:** en `botcake.io/<pagina>/sequence`, cada secuencia encendida: sus pasos,
el tiempo de cada uno y si tienen filtro. Si tiene la confirmacion de pedidos,
`mibot verificar-confirmacion`.

| Tiempo hasta el seguimiento | Nivel |
|---|---|
| Mas de 24 horas, uno solo y suave | Bien |
| De 1 a 24 horas | A mejorar |
| De 30 minutos a 1 hora | Grave |
| Menos de 30 minutos | Urgente |

Y por lo que dice: "¿Sigues ahi? Aqui estoy" esta bien; "¿Te interesa?", a mejorar;
"¿Con que metodo vas a pagar?" a quien no mostro interes, grave.

**La excepcion de la confirmacion de pedidos:** su recordatorio a las 2 horas es un aviso
sobre un pedido que la persona acaba de hacer, uno solo, de Utilidad y solo entre las 8 y
las 22. Asi montado esta **bien**. Es **grave** si le llega a quien ya confirmo (le falta el
filtro «Etiqueta igual R1») o si hay mas de un recordatorio.

**Que recomendar:** quitar los seguimientos de menos de 24 horas, dejar uno como mucho, sin
hablar de pago. Texto: "Hola, vi que nos escribiste. Si tienes alguna duda, aqui estoy."

## 4. Dos mensajes seguidos sin respuesta

**Que mirar:** algo que manda un segundo mensaje sin que la persona haya contestado el
primero. Genera bloqueos y reportes.

**Como se revisa:** en las secuencias y flujos encendidos, buscar pasos que salen uno detras
de otro sin esperar respuesta, y flujos que empiezan con dos mensajes. Sin conversaciones
exportadas no se puede contar cuantas veces pasa: se revisa si la forma de lo montado lo
permite.

**Nivel:** si algo montado manda dos o mas mensajes seguidos sin esperar respuesta, **grave**.
Una sola excepcion: informacion que la persona pidio justo antes (por ejemplo, los datos de
pago despues de elegir como pagar).

El bot del plugin pide que repita **una vez** cuando no entiende, y a la segunda pasa a una
persona: eso esta bien.

**Que recomendar:** que nada mande un segundo mensaje si no hubo respuesta al primero.

## 5. Volumen y horario

**Que mirar:** difusiones (mensajes a muchos contactos a la vez), picos de envio y mensajes
automaticos de madrugada.

**Como se revisa:** en `botcake.io/<pagina>/broadcast`, las difusiones enviadas y
programadas: cuantas, a cuantas personas y a quien. En las secuencias, si el horario de
envio es "Cada vez" (a cualquier hora) o un rango.

| | Bien | A mejorar | Grave |
|---|---|---|---|
| Difusiones | A quien pidio recibirlas | A toda la base, de vez en cuando | A gente que nunca escribio, o seguidas |
| Picos | Volumen parejo | Dias con el doble de lo normal | Dias con el triple o mas |
| Madrugada (11 pm a 6 am) | Nada automatico | | Seguimientos o difusiones a esa hora |

La confirmacion inmediata de un pedido hecho de madrugada no cuenta: la persona acaba de
comprar y la espera.

**Que recomendar:** seguimientos solo en rango (de 7 u 8 de la manana a 10 de la noche),
difusiones solo a quien acepto recibirlas y repartidas en el tiempo.

## 6. El trato del equipo

**Que mirar:** respuestas de personas (no del bot) secas, impacientes o que descalifican al
cliente. Generan reportes directos.

**Como se revisa:** preguntale como atiende su equipo, o que mire en la bandeja algunas
conversaciones recientes atendidas por personas. Frases de alerta: "ya le dije", "no
insista", "ponga atencion", "no le conviene".

| | Nivel |
|---|---|
| Amable, tambien con quien no compra | Bien |
| Seco o impaciente | A mejorar |
| Descalifica o confronta | Grave |

**Que recomendar:** tres reglas para el equipo: siempre amable, si el cliente no compra se
despide con cortesia, nunca discutir. Y dos o tres respuestas escritas para los casos
dificiles.

## 7. Como esta armado el bot

**Que mirar:** si pregunta de una en una o todo junto, si responde distinto segun lo que le
dicen, si pasa a una persona cuando no sabe.

**Como se revisa:** si tiene el bot que conversa, dos o tres preguntas de prueba con
`mibot preguntar` (con su permiso). Si tiene otro bot, que te describa como responde.

| | Nivel |
|---|---|
| Una pregunta a la vez, responde segun lo que le dicen, pasa a una persona | Bien |
| Ordenado pero siempre igual | A mejorar |
| Todo en un solo mensaje, sin pasar a una persona | Grave |

**Que recomendar:** si es el bot del plugin, ajustar el prompt con su recorrido. Si es otro
bot, describir el cambio en concreto (que pregunta primero, cuando pasa a una persona).

---

## Cuanto pesa cada punto

| Punto | Peso ante Meta |
|---|---|
| 1. Lo primero que recibe | Alto: es lo primero que ve la persona |
| 2. Gente que no vuelve | El mas alto: es la senal directa |
| 3. Seguimientos | Alto: insistir es spam |
| 4. Dos mensajes seguidos | Alto: provoca reportes |
| 5. Volumen y horario | Medio |
| 6. Trato del equipo | Medio: provoca reportes directos |
| 7. Como esta armado el bot | Medio: suele ser la causa de los demas |
