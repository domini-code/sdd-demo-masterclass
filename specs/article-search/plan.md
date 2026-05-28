# Technical Plan — Búsqueda de Artículos en Tiempo Real

> Derivado de `spec.md` confirmado. Feature slug: `article-search`.

---

## 1. Stack final

- **Frontend:** Next.js 15 App Router + React 19 + TypeScript strict — ya en el proyecto.
- **Filtrado:** cliente-side con `useState` + Array.filter — sin nueva API route ni React Query.
- **Normalización:** función `normalize(str)` con `str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()`.
- **UI:** Tailwind CSS v4 + primitivas de `app/components/ui/` si aplica.

---

## 2. Componentes

### `app/_components/ArticleSearch.tsx` (nuevo, Client Component)

Responsabilidades:
1. Recibe `posts: Post[]` como prop.
2. Mantiene estado `query: string` con `useState("")`.
3. Filtra los posts comparando `normalize(query)` contra `normalize(post.title)` y `normalize(post.excerpt)`.
4. Renderiza el `<input>` con `aria-label="Buscar artículos"` y placeholder "Buscar artículos…".
5. Renderiza los `<PostCard>` filtrados.
6. Muestra "No se encontraron artículos" si el array filtrado está vacío y `query !== ""`.

### `app/page.tsx` (modificado)

- Sigue siendo async Server Component (obtiene posts en servidor).
- Pasa los posts al componente `<ArticleSearch posts={posts} />`.

---

## 3. Orden de construcción

1. Crear `app/_components/ArticleSearch.tsx`.
2. Modificar `app/page.tsx` para usar `<ArticleSearch>`.
3. Añadir test E2E en `e2e/article-search.spec.ts`.

---

## 4. Definition of done

- [ ] El input aparece en `/` con `aria-label="Buscar artículos"`.
- [ ] Escribir en el input filtra la lista en tiempo real.
- [ ] El filtrado ignora mayúsculas y acentos.
- [ ] Mensaje "No se encontraron artículos" cuando no hay coincidencias.
- [ ] Al borrar, vuelven todos los artículos.
- [ ] Test E2E (golden path) en verde.
- [ ] `npm run lint` y `npm test` en verde.
