# Barrio Vivo

**Tu junta, tu barrio, tu voz.**

Prototipo navegable de Barrio Vivo, una plataforma comunitaria para juntas de vecinos.
Cada actividad se clasifica en una de 7 áreas de acción y suma puntos en una tabla general pública.
Al cierre de cada temporada se entregan los Premios Barrio Vivo por área.

Esta versión usa datos de ejemplo y guarda lo que haces en la demo en tu navegador.
Todavía no tiene base de datos ni inicio de sesión real.

## Perfiles

| Perfil | Tipo | Qué puede hacer |
| --- | --- | --- |
| Vecino | App móvil | El Queltehue avisa, emergencias, Manos Vecinas (ayudas, voluntariado y sección jóvenes), consultas y necesidades con semáforo (respuesta u obra con avance), sellos de avance, tabla por liga y premios, perfil con horas certificadas, insignias, comunidades, letra grande y mapudungun. Mi junta: asambleas y actas, cuentas de la junta, reserva de la sede, memoria del barrio y encuesta anual |
| Directiva | App móvil | Panel con radar, índice de vitalidad y jóvenes, registrar actividades con público objetivo, fotos y QR o lista en papel, unir necesidades iguales, cargar votos y necesidades de la asamblea, asambleas en vivo con quórum, acuerdos y acta automática, calendario de vencimientos, fondos con carpeta de postulación (requisitos y antigüedad de certificados según bases), revisión mensual de horas de voluntariado, tesorería transparente, reservas de la sede, aprobar propuestas juveniles, avisos oficiales, resumen semanal para WhatsApp, documentos, socios por tramo y traspaso de directiva |
| Administración | Panel web | Catálogo de fondos desde sus bases, validar actividades, incorporar juntas, premiación (7 áreas + Premio Juventud), moderación y reglas |
| Municipio | Panel web | Vitalidad por sector, prioridad territorial (vitalidad × vulnerabilidad), encuesta de percepción por sector, mapa de necesidades, fondos municipales con resultados de postulación, brechas por área, participación juvenil, Manos Vecinas, alertas, responder necesidades e informe al concejo |

En el perfil Vecino puedes entrar como Marta (52 años, socia) o como Javiera (22 años, embajadora digital) para ver la experiencia adulta y la joven.

## Cómo se ganan puntos

Cada actividad suma; si es verificada (QR o lista firmada en papel), con otra junta (+60) o con jóvenes, suma más. Cada ayuda cumplida en Manos Vecinas suma en Social y Solidaridad.

Lo primero que ve una junta es su sello de avance: Semilla, Brote, Árbol o Bosque. La tabla compara solo dentro de cada liga, por puntos cada 10 socios. Los premios son reconocimiento y nunca fondos ni recursos municipales.

## Las 7 áreas

Cultura y Patrimonio · Deporte y Recreación · Social y Solidaridad · Mejoramiento del Barrio ·
Salud y Bienestar · Medio Ambiente · Seguridad y Convivencia

## Cómo probarlo en tu computador

Necesitas [Node.js](https://nodejs.org) 20 o superior y [pnpm](https://pnpm.io). Si no tienes pnpm, actívalo una vez con `corepack enable pnpm`.

```powershell
pnpm install
pnpm dev
```

Abre la dirección que aparece en la terminal (normalmente http://localhost:5173).

## Otros comandos

| Comando | Para qué sirve |
| --- | --- |
| `pnpm build` | Genera la app lista para publicar en la carpeta `dist` |
| `pnpm build:single` | Genera un único `index.html` autocontenido en `dist-single`, útil para compartir la demo |
| `pnpm preview` | Sirve localmente la versión generada con `build` |

## Estructura del código

```
src/
  data/       Áreas, tipos y datos de ejemplo (juntas, actividades, necesidades, documentos…)
  lib/        Reglas de puntaje, tabla general, premios e Índice de Vitalidad Comunitaria
  state/      Estado de la demo y acciones (votar, registrar actividad, responder necesidad…)
  components/ Íconos, radar, semáforo, navegación y piezas comunes
  pages/      Selector de perfil y las cuatro experiencias: vecino, directiva, admin, municipio
```

Las reglas de puntaje y los pesos del índice están en `src/lib/scoring.ts` y son una propuesta inicial
para calibrar durante el piloto.

## Próximo paso

Conectar Supabase: inicio de sesión por perfil, base de datos real, almacenamiento de fotos y documentos,
y reglas de acceso para que el municipio vea solo datos agregados.

## Certificados de voluntariado

Los emite la junta de vecinos, con firma de presidencia y secretaría, y el municipio cuando hay convenio. Barrio Vivo solo respalda el registro: cada certificado tiene un código que se comprueba en `#/verificar`.
