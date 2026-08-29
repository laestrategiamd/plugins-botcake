# Plugins de La Estrategia para Claude Code

Herramientas para trabajar con el ecosistema Pancake (Botcake, Webcake, CRM, POS)
desde Claude Code.

## Instalacion

En tu terminal, dentro de Claude Code:

```
/plugin marketplace add laestrategia/plugins-botcake
```

```
/plugin install botcake-mi-primer-bot@la-estrategia
```

## Que hay aqui

### `botcake-mi-primer-bot`

Te acompana desde cero hasta tener un bot con inteligencia artificial respondiendo en tu
WhatsApp, Facebook o Instagram:

1. Te hace las preguntas sobre tu negocio.
2. Arma el prompt (las instrucciones del bot) y la base de conocimiento (sus datos).
3. Dibuja el diagrama del flujo y te lo ensena antes de construir nada.
4. Lo monta en Botcake.
5. Lo prueba contigo y solo entonces lo enciende.

Trabaja **por tandas**: guarda el avance en un archivo y se retoma en otra sesion
escribiendo *sigamos con mi bot*.

## Que necesitas antes de empezar

- Cuenta de Pancake con una pagina conectada (WhatsApp API, Facebook o Instagram).
- Permisos de administrador en esa pagina.
- La billetera de Pancake conectada, con saldo (la conecta el dueno de la cuenta).
- Node.js instalado (`nodejs.org`, version LTS).
- Claude Code en tu computador.

## Aviso

Este plugin trabaja sobre tu propia cuenta de Botcake, con tu sesion. No pide ni guarda
contrasenas: tu inicias sesion en el navegador que se abre.

Botcake es una plataforma de terceros y puede cambiar. Si algo deja de funcionar, el plugin
te lleva por el camino manual para que termines igual, y te pide que reportes el fallo.

## Licencia

MIT. Ver `LICENSE`.
