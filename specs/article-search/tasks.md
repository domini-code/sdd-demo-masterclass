# Tasks — Búsqueda de artículos en tiempo real

> Derivado de `spec.md` + `plan.md` confirmados.
> Ejecutar en orden estricto. Un task a la vez.

---

## Convenciones

- `[ ]` pendiente · `[x]` hecho
- ⚙️ Setup · 🔴 Red (test falla) · 🟢 Green (implementación mínima) · 🔵 Refactor · 🔗 Integración · 🎭 E2E

---

## Phase 0 — Verificación

- [x] ⚙️ **Runner unit verificado:** Vitest 2.1.1 (`npm test`).
- [x] ⚙️ **Runner E2E verificado:** Playwright (`@playwright/test`) en `devDependencies`. `playwright.config.ts` ya en raíz con `baseURL: http://localhost:3000` y `webServer` configurado.

---

## Phase 1 — Componente `SearchablePostList`

### Feature: render del input y grid completa

- [x] 🟢 **Crear `app/_components/SearchablePostList.tsx`**
  - `"use client"`.
  - Props: `{ posts: Post[] }`.
  - State: `useState<string>("")` para query.
  - Render: input con `aria-label="Buscar artículos"`, `placeholder="Buscar artículos…"`, `type="search"`.
  - Render: grid `PostCard` con la lista filtrada.
  - Criterio: `spec.md §3 → "El sistema muestra un <input>… encima de la lista"`.

### Feature: filtrado case+accent-insensitive

- [x] 🟢 **Helper `normalize(str)`** en el mismo archivo
  - `str.normalize("NFD").replace(/[combining]/g, "").toLowerCase()`.
  - Criterio: `spec.md §3 → "case-insensitive y elimina acentos"`.

- [x] 🟢 **Filtrar por title O excerpt**
  - `useMemo` con dependencias `[posts, query]`.
  - Query vacío → devolver `posts` tal cual.
  - Criterio: `spec.md §3 → "coincidencia parcial en title o excerpt"`.

### Feature: estado vacío

- [x] 🟢 **Render condicional del mensaje "No se encontraron artículos"**
  - Cuando `filtered.length === 0`, mostrar el texto en lugar de la grid.
  - Criterio: `spec.md §3 → "No se encontraron artículos"`.

---

## Phase 2 — Integración en `/`

- [x] 🔗 **Actualizar `app/page.tsx`**
  - Quitar `featured = posts.slice(0,3)`.
  - Renderizar `<SearchablePostList posts={posts} />` dentro de la sección "Últimos artículos".
  - Verificar compilación: `npx tsc --noEmit`.

---

## Phase 3 — E2E (Playwright)

- [x] 🎭 **Crear `e2e/article-search.spec.ts`**
  - Golden path: visit `/`, escribir "react", asertar que aparece el post de React Query y que el post de Vitest **no** aparece, borrar input → todos los posts visibles de nuevo.
  - Caso sin resultados: escribir "zzzzzz" → verificar `"No se encontraron artículos"`.
  - Caso acentos: escribir "tutoriales" (subtítulo en el hero hay variantes) — verificar localización del input por `aria-label`.

---

## Phase 4 — Cierre

- [x] 🔗 **`npm run lint` en verde**
- [x] 🔗 **`npm test` en verde**
- [x] 🔗 **`npm run test:e2e` en verde**

---

## Reglas de ejecución

1. Un task a la vez. No abrir dos en paralelo.
2. Si un task revela ambigüedad en el spec: parar, actualizar `spec.md` y `plan.md`, regenerar los tasks afectados.
3. Commits: uno por fase completada. Mensaje sugerido: `[phaseN] feat(article-search): descripción`.
