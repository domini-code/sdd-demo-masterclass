# Tasks — Búsqueda de Artículos en Tiempo Real

> Orden TDD: tests primero, luego implementación mínima que los pase.

---

- [ ] **T1 — Crear componente `ArticleSearch`**
  - Crea `app/_components/ArticleSearch.tsx` con `"use client"`.
  - Acepta prop `posts: Post[]`.
  - Renderiza `<input aria-label="Buscar artículos" placeholder="Buscar artículos…" />`.
  - Renderiza todos los `<PostCard>` cuando `query` está vacío.
  - **Criterio:** el input existe en el DOM con el aria-label correcto.

- [ ] **T2 — Lógica de filtrado case-insensitive sin acentos**
  - Implementa función `normalize(str)` que elimina diacríticos y convierte a minúsculas.
  - Filtra posts donde `normalize(post.title)` o `normalize(post.excerpt)` contiene `normalize(query)`.
  - **Criterio:** "react" filtra artículos con "React" en el título; "supabase" filtra "Supabase".

- [ ] **T3 — Mensaje de estado vacío**
  - Cuando el array filtrado está vacío y `query !== ""`, muestra el texto "No se encontraron artículos".
  - Cuando `query === ""`, nunca muestra ese mensaje.
  - **Criterio:** texto visible en pantalla cuando no hay resultados.

- [ ] **T4 — Modificar `app/page.tsx`**
  - Importar y usar `<ArticleSearch posts={posts} />` en lugar de la sección de artículos actual.
  - Mantener la sección de hero (h1 + párrafo).
  - **Criterio:** la página `/` pasa los posts al componente de búsqueda.

- [ ] **T5 — Test E2E golden path**
  - Crea `e2e/article-search.spec.ts`.
  - Navega a `/`, verifica que el input existe.
  - Escribe "react" → verifica que aparece al menos un resultado.
  - Borra el texto → verifica que vuelven todos los artículos.
  - Escribe "xxxxxxxxxx" → verifica el mensaje "No se encontraron artículos".
  - **Criterio:** `npm run test:e2e` en verde.
