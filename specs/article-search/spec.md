# Spec — Búsqueda de Artículos en Tiempo Real

> Dominicode Spec-First template (Bezael Pérez).
> Feature slug: `article-search`

---

## Visión

Permitir a cualquier visitante (autenticado o no) filtrar los artículos de la página
principal mientras escribe, sin recargar la página. Reduce el tiempo necesario para
encontrar un artículo concreto cuando la lista crece.

---

## Usuarios

**Visitante (anónimo o autenticado):** quiere encontrar un artículo por título o
descripción sin tener que leer toda la lista.

---

## Funcionalidades

**Must:**
- Campo `<input>` con placeholder "Buscar artículos…" y `aria-label="Buscar artículos"` visible sobre la lista de artículos.
- Filtrado instantáneo (sin petición de red) mientras el usuario escribe.
- Coincidencia en título **y** excerpt del artículo.
- Filtrado case-insensitive y sin distinción de acentos (ej: "react" encuentra "React").
- Mensaje "No se encontraron artículos" cuando no hay coincidencias.
- Al borrar el texto, se restaura la lista completa.

**Should:**
- El input está limpio al entrar a la página (sin texto previo).

**Could:**
- Debounce en el filtrado (no necesario dado que el filtrado es cliente-side y los posts son pocos).

---

## Flujos

**Happy path:**
1. El usuario visita `/`.
2. Ve el campo de búsqueda encima de la lista de artículos.
3. Escribe "react" en el campo.
4. La lista se actualiza instantáneamente mostrando solo artículos cuyo título o excerpt contiene "react" (insensible a mayúsculas y acentos).
5. El usuario borra el texto — vuelven a aparecer todos los artículos.

**Sin resultados:**
1. El usuario escribe un término sin coincidencias (ej: "xxxxxxxxxx").
2. La lista queda vacía y se muestra el mensaje "No se encontraron artículos".

---

## Arquitectura

- **`app/page.tsx`** — actualmente Server Component. Se convierte en un Client Component
  o se extrae la lógica de búsqueda a un componente cliente hijo que recibe `posts` como prop.
- **`app/_components/ArticleSearch.tsx`** — nuevo Client Component (`"use client"`). Contiene
  el `<input>`, el estado `query` con `useState`, la lógica de filtrado (normalización de texto)
  y la lista filtrada de `<PostCard>`.
- No se necesita API route ni React Query: el filtrado opera sobre los posts ya cargados.
- Sin dependencias nuevas.

**Archivos afectados:**
| Archivo | Cambio |
|---------|--------|
| `app/page.tsx` | Pasa `posts` al nuevo componente `ArticleSearch` |
| `app/_components/ArticleSearch.tsx` | Nuevo — input + lógica de filtrado + lista |

---

## NFRs

- **Rendimiento:** filtrado síncrono en cliente sobre array pequeño (< 100 posts); sin latencia perceptible.
- **Accesibilidad:** `aria-label="Buscar artículos"` en el input para localización semántica por Playwright y lectores de pantalla.
- **Seguridad:** sin nuevas superficies de ataque — solo lógica cliente sobre datos estáticos.
- **Idioma:** placeholder y mensaje de estado vacío en español.
- **Dependencias:** cero librerías nuevas.
