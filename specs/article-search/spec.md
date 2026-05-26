# Spec — Búsqueda de artículos en tiempo real

> Dominicode Spec-First template (Bezael Pérez).
> Feature slug: `article-search`

---

## SECTION 1 — Visión del Producto

Los visitantes de la página principal (`/`) pueden filtrar los artículos del blog
en tiempo real desde un campo de búsqueda, viendo solo los artículos cuyo título
o extracto contiene el texto introducido, sin recargar la página.

---

## SECTION 2 — Usuarios y Casos de Uso

**Usuario anónimo / autenticado:** ambos perfiles ven el mismo input y obtienen
los mismos resultados — la búsqueda no requiere sesión porque opera sobre los
posts ya cargados (datos públicos).

Caso de uso principal:
- Escribir parte del título o del extracto y ver la lista filtrarse al instante.
- Borrar el campo y volver a ver todos los artículos.
- Buscar con o sin acentos: "react" debe encontrar "React" y "ráct".

---

## SECTION 3 — Funcionalidades

**Módulo: Input de búsqueda (homepage)**
- El sistema muestra un `<input>` con `placeholder="Buscar artículos…"` encima
  de la lista de artículos en `/`.
- El input tiene `aria-label="Buscar artículos"` para localización semántica
  (lectores de pantalla y Playwright).
- El input es controlado por React state (`useState`) — sin debounce, filtrado
  síncrono al cambio.

**Módulo: Filtrado en cliente**
- El sistema filtra la lista de posts visibles por coincidencia parcial en
  `title` **o** `excerpt`.
- La comparación es case-insensitive (todo en minúsculas).
- La comparación ignora diacríticos (acentos, tildes): "react" matchea "React"
  y "rácion" matchea "ración".
- Si el campo está vacío, se muestran **todos** los artículos.

**Módulo: Estado vacío**
- Cuando ninguna entrada coincide, el sistema muestra el texto
  `"No se encontraron artículos"` en lugar de la grid.

---

## SECTION 4 — Flujos de Usuario

**Flujo — Filtrar artículos:**
1. El usuario entra a `/`.
2. El sistema renderiza el input y la grid completa con todos los posts.
3. El usuario escribe `"react"` en el input.
4. El sistema actualiza la grid mostrando solo posts con "react" en título
   o extracto, sin recargar.
5. El usuario borra el contenido del input.
6. El sistema vuelve a mostrar todos los posts.

**Flujo — Sin resultados:**
1. El usuario escribe un texto que no aparece en ningún post (ej: `"zzzzz"`).
2. El sistema oculta la grid y muestra el mensaje `"No se encontraron artículos"`.
3. El usuario borra el texto y la grid completa reaparece.

---

## SECTION 5 — Arquitectura

Stack definido por el proyecto existente — no se introduce ningún cambio de stack.

- **Frontend:** Next.js 15 App Router + React 19 + TypeScript (strict)
- **Server Component:** `app/page.tsx` sigue siendo Server Component y carga
  los posts vía `getPosts()` (mismo patrón actual).
- **Client Component nuevo:** `app/_components/SearchablePostList.tsx` —
  recibe los posts como prop y maneja estado del input + filtrado.
- **UI:** `<PostCard>` existente — sin cambios.
- **Sin API nueva:** el filtrado es 100% cliente sobre la prop recibida.

---

## SECTION 6 — Non-Functional Requirements

- **Performance:** filtrado síncrono en `useMemo` sobre la lista ya cargada —
  trivial para el volumen actual (< 50 posts).
- **Accesibilidad:** `aria-label="Buscar artículos"` en el input;
  `type="search"`; mensaje de "sin resultados" como texto plano legible.
- **Idioma:** español — placeholder, aria-label y mensaje vacío en español.
- **Dependencias:** cero librerías nuevas — `useState` + `useMemo` del proyecto.
- **Compatibilidad:** la normalización de acentos usa `String.prototype.normalize("NFD")`
  + regex de combining marks; soportado en todos los navegadores modernos.

---

## Preguntas abiertas

- [x] ¿Debounce o filtrado síncrono? — **Resuelto:** síncrono. Los posts viven
  en memoria; el coste es despreciable y el feedback inmediato mejora la UX.
- [x] ¿Buscar también por tags? — **Resuelto:** no en v1. Solo título y excerpt
  (lo que pide el issue).
- [x] ¿Persistir la query en URL? — **Resuelto:** no en v1. Estado local.

---

*Cuando todas las secciones estén cerradas y las preguntas abiertas resueltas
(o diferidas explícitamente), continuar a `plan.md`.*
