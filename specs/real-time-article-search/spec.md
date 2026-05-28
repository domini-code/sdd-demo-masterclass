# Spec — Búsqueda de artículos en tiempo real

> Dominicode Spec-First template (Bezael Pérez).
> Feature slug: `real-time-article-search`

---

## Visión

Los usuarios que visitan la página principal (`/`) pueden encontrar artículos relevantes sin
necesidad de navegar por toda la lista. Un campo de búsqueda filtra los artículos visibles
instantáneamente mientras el usuario escribe, reduciendo la fricción para descubrir contenido.

---

## Usuarios

**Visitante anónimo:** busca artículos sobre un tema concreto desde la página principal sin
necesidad de autenticarse.

**Usuario autenticado:** igual que el visitante anónimo; la búsqueda no depende de la sesión.

---

## Funcionalidades

**Must have**
- Un `<input>` con `placeholder="Buscar artículos…"` y `aria-label="Buscar artículos"` aparece
  encima de la lista de artículos en la página principal.
- Al escribir, la lista se filtra instantáneamente (sin recarga de página) mostrando solo los
  artículos cuyo título o excerpt contenga el texto introducido.
- La comparación es case-insensitive y normaliza acentos (ej: "react" encuentra "React", "codigo"
  encuentra "código").
- Cuando el filtro no produce resultados, se muestra el mensaje "No se encontraron artículos".
- Al borrar el texto del input, vuelven a mostrarse todos los artículos.

**Should have**
- El input tiene un icono de lupa (Search) a la izquierda para indicar su propósito visualmente.
- El estado de búsqueda no se persiste en la URL (filtrado puramente en memoria).

**Could have**
- Debounce del input para entornos con listas muy largas (no necesario con datos estáticos).

---

## Flujos

**Happy path — encontrar un artículo:**
1. El usuario visita `/`.
2. Ve el campo de búsqueda sobre la lista de artículos.
3. Escribe "react" en el campo.
4. La lista se actualiza instantáneamente mostrando solo los artículos que contienen "react"
   en título o excerpt.
5. El usuario hace clic en un artículo y navega al detalle.

**Flujo alternativo — sin resultados:**
1. El usuario escribe un texto que no coincide con ningún artículo (ej: "xyz123").
2. La lista muestra el mensaje "No se encontraron artículos" en lugar de cards.

**Flujo alternativo — limpiar búsqueda:**
1. El usuario ha filtrado la lista.
2. Borra el texto del input.
3. Todos los artículos vuelven a ser visibles.

---

## Arquitectura

**Archivos afectados / creados:**

```
app/
├── page.tsx                            # MODIFICADO: pasa posts como prop al componente cliente
└── _components/
    └── ArticleSearch.tsx               # NUEVO: componente cliente con input + lista filtrada
```

**Patrón:**
- `app/page.tsx` permanece Server Component; obtiene los posts con `getPosts()` y los pasa como
  prop a `<ArticleSearch posts={posts} />`.
- `ArticleSearch` es un Client Component (`"use client"`); gestiona el estado del input con
  `useState` y calcula los posts filtrados con `useMemo`. No necesita React Query porque los datos
  ya están en memoria.
- La normalización de acentos usa `String.prototype.normalize('NFD')` con regex para eliminar
  diacríticos.

**Dependencias:** ninguna nueva; usa `lucide-react` (ya instalada) para el icono de lupa.

---

## NFRs

- **Rendimiento:** el filtrado se ejecuta en `useMemo` para evitar recálculos innecesarios.
- **Accesibilidad:** el input tiene `aria-label="Buscar artículos"` para lectores de pantalla y
  localización semántica en tests Playwright.
- **Seguridad:** el filtrado es puramente client-side sobre datos estáticos; no hay entrada de
  usuario enviada al servidor.
