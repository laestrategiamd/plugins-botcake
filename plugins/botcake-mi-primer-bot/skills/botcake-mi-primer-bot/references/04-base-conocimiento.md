# La base de conocimiento: los datos del bot

Es un archivo de texto con la informacion del negocio. El bot lo consulta cada vez que
alguien le pregunta algo.

**Se separa del prompt por una razon practica:** los precios cambian cada mes; las
instrucciones casi nunca. Cambiar un precio tiene que ser abrir un archivo, cambiar una
linea y volverlo a subir — no reescribir el bot.

---

## El formato

Archivo `.txt` plano. Nada de PDF con columnas ni Word con tablas de colores: el bot lee
peor los formatos complicados.

**La regla de oro del formato: pregunta y respuesta, no parrafos.**

El bot busca por parecido con lo que el cliente escribio. Si la informacion esta escrita
como la escribiria un cliente, la encuentra. Si esta escrita como un folleto, no.

Mal:

```
Nuestra empresa cuenta con una amplia trayectoria y ofrece servicios de calidad con
tiempos de entrega competitivos a nivel nacional.
```

Bien:

```
P: Hacen envios? A donde?
R: Si, enviamos a toda Colombia. A Medellin y Bogota llega en 1 a 2 dias habiles; al resto
del pais, de 3 a 5 dias habiles.

P: Cuanto cuesta el envio?
R: 12.000 pesos. Gratis en compras desde 150.000 pesos.
```

---

## La estructura del archivo

```
# [NOMBRE DEL NEGOCIO] — Informacion para atencion
# Actualizado: [fecha]

## 1. QUIENES SOMOS
## 2. PRODUCTOS Y PRECIOS
## 3. ENVIOS Y COBERTURA
## 4. FORMAS DE PAGO
## 5. HORARIOS Y UBICACION
## 6. GARANTIAS, CAMBIOS Y DEVOLUCIONES
## 7. PREGUNTAS FRECUENTES
## 8. OBJECIONES Y COMO RESPONDERLAS
## 9. LO QUE NO HACEMOS
```

**La seccion 8 es la que casi nadie pone y la que mas vende.** Son las respuestas a lo que
frena la compra: "esta caro", "lo pienso", "no confio", "no hay certificado", "prefiero
verlo en persona". Preguntale al usuario cuales son las tres objeciones que mas escucha y
como las responde el mejor vendedor del equipo. Eso va aqui, con esas palabras.

**La seccion 9 evita mentiras.** Lo que el negocio NO vende, NO hace y NO cubre, escrito
explicito. Sin esto, el bot rellena huecos inventando.

---

## Reglas de escritura

- **Fechas completas.** "Del 3 al 15 de septiembre de 2026", nunca "este mes" ni "la
  proxima semana": el archivo se queda escrito y el mes pasa.
- **Precios con moneda.** "85.000 COP", no "85 mil".
- **Un dato en un solo sitio.** Si el horario esta en la seccion 5 y otra vez en las
  preguntas frecuentes, algun dia van a decir cosas distintas.
- **Lo que no se sabe, no se escribe.** Va a la lista de PENDIENTES de `mi-bot.json`.

---

## Si el negocio tiene catalogo en el POS de Pancake

No copies los productos al archivo. El agente de Botcake se puede conectar al catalogo y
leer precios y existencias al dia. Copiarlos a mano significa que en dos meses el bot
cotiza con precios viejos.

En ese caso, en la base de conocimiento va todo **menos** productos y precios, y en el
prompt se le dice que los productos los consulta en el catalogo.

---

## Limites que hay que conocer

- **Un agente aguanta 10 archivos de conocimiento.** Con uno bien hecho basta para empezar.
- **Subir un archivo con el mismo nombre NO reemplaza al anterior:** quedan los dos. Lo que
  decide cual usa el bot es cual esta marcado. Esto importa en la Fase 7 y esta explicado
  ahi.

---

## Antes de darla por buena

1. Ninguna seccion vacia (si no aplica, se escribe "No aplica" y por que).
2. Ningun precio ni horario repetido en dos sitios con valores distintos.
3. Ningun dato que el prompt prometa y aqui no este.
4. Todas las preguntas frecuentes escritas como las escribiria un cliente, no como las
   escribiria el dueno.
5. Fechas absolutas, no relativas.

Guardala como `conocimiento-<negocio>.txt` y dile la ruta al usuario. No la pegues en el
chat.
