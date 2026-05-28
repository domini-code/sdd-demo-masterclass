# Tasks — Búsqueda de artículos en tiempo real

> Derivado de `spec.md` + `plan.md` confirmados.
> Ejecutar en orden estricto. Un task a la vez.

---

## Convenciones

- `[ ]` pendiente · `[x]` hecho
- ⚙️ Setup · 🔴 Red (test falla) · 🟢 Green (implementación mínima) · 🔵 Refactor · 🔗 Integración

---

## Phase 0 — Verificación del runner

- [x] ⚙️ **Runner verificado:** Vitest 2.1.1 y Playwright 1.60.0 detectados en `package.json`.

---

## Phase 1 — Componente `ArticleSearch`

- [ ] 🟢 **Crear `app/_components/ArticleSearch.tsx`**
  - Recibe `posts: Post[]` como prop.
  - Estado: `useState<string>("")` para el valor del input.
  - Filtrado: `useMemo` que normaliza diacríticos y busca en `title` + `excerpt`.
  - Renderiza: input con `aria-label="Buscar artículos"`, grid de `PostCard`, o mensaje vacío.
  - Criterio: el componente renderiza correctamente en TypeScript strict sin errores.

---

## Phase 2 — Integración en `page.tsx`

- [ ] 🔗 **Modificar `app/page.tsx`**
  - Pasar `posts` completo a `<ArticleSearch posts={posts} />`.
  - Mantener `page.tsx` como Server Component.
  - Criterio: la página principal muestra el input y los artículos filtrados.

---

## Phase 3 — Tests E2E

- [ ] 🔴 **Crear `e2e/article-search.spec.ts`**
  - Test golden path: navegar a `/`, escribir en el input, verificar lista filtrada.
  - Test sin resultados: texto sin coincidencias → mensaje "No se encontraron artículos".
  - Test limpiar: filtrar y borrar → todos los artículos visibles.
  - Criterio: `npm run test:e2e` pasa en verde.
