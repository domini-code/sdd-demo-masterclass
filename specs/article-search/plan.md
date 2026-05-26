# Technical Plan — Búsqueda de artículos en tiempo real

> Derivado de `spec.md` confirmado. Feature slug: `article-search`.

---

## 1. Stack final

- **Frontend:** Next.js 15 App Router + React 19 + TypeScript strict — ya en el proyecto.
- **Server Component:** `app/page.tsx` mantiene su rol — fetch de posts vía `getPosts()`.
- **Client Component:** `app/_components/SearchablePostList.tsx` — `"use client"`,
  state `useState`, derivación `useMemo`.
- **UI:** `<PostCard>` existente reutilizado tal cual.
- **Test runner (unit):** Vitest 2.1.1 — ya en el proyecto.
- **Test runner (E2E):** Playwright (`@playwright/test`) — ya en `devDependencies`.

### Stacks descartados

- **URL state / nuqs:** descartado — el spec dice estado local, no hay requisito
  de compartir URL.
- **Debounce / `useDeferredValue`:** descartado — < 50 posts, filtrado síncrono
  es imperceptible y simplifica el código.
- **Búsqueda server-side / API route nueva:** descartado — el issue dice
  explícitamente que se filtra sobre posts ya cargados.

---

## 2. Modelo de datos

Sin cambios en DB. Operamos sobre `Post[]` (interfaz ya definida en
`app/lib/types.ts`):

```ts
interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  coverImage: string
  publishedAt: string
  readingTime: number
  tags: string[]
}
```

Solo `title` y `excerpt` participan en el filtrado.

---

## 3. Contratos

**API:** ninguna. Es 100% cliente.

**Frontend — componentes:**

| Componente | Ubicación | Responsabilidad |
|------------|-----------|-----------------|
| `SearchablePostList` | `app/_components/SearchablePostList.tsx` | Client component. Recibe `posts: Post[]`. Renderiza input + grid filtrada o mensaje de "sin resultados". |
| `HomePage` | `app/page.tsx` | Server Component existente. Pasa `posts` a `SearchablePostList`. |

**Props del nuevo componente:**

```ts
interface SearchablePostListProps {
  posts: Post[]
}
```

**Función de normalización** (interna al componente o `lib/utils.ts` si crece):

```ts
function normalize(str: string): string {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}
```

---

## 4. Dependencias externas

- Ninguna nueva. Todo con React core (`useState`, `useMemo`) y tipos del proyecto.

---

## 5. Riesgos técnicos y mitigaciones

- **Riesgo:** la homepage actual solo muestra 3 posts (`featured = posts.slice(0,3)`).
  Si la búsqueda solo opera sobre esos 3, la feature queda mutilada.
  **Mitigación:** la nueva sección entrega la lista completa a `SearchablePostList`
  y elimina el `slice(0,3)`. El usuario sigue viendo "Últimos artículos" como
  título y "Ver todos →" como link, pero la grid ahora muestra todos los posts
  (5 actualmente). Esto mejora el descubrimiento y mantiene coherencia con el
  spec ("vuelven a aparecer **todos** los artículos").
- **Riesgo:** `String.prototype.normalize("NFD")` puede no estar en navegadores
  muy antiguos. **Mitigación:** Next.js 15 + React 19 ya requieren navegadores
  modernos; soporte universal en evergreen.
- **Riesgo:** doble re-render en cada keystroke si el filtrado fuera caro.
  **Mitigación:** `useMemo` con `[posts, query]` y volumen pequeño — irrelevante.

---

## 6. Orden de construcción

1. **`SearchablePostList`** — crear el client component con su lógica.
2. **`app/page.tsx`** — sustituir la grid hardcoded por `<SearchablePostList posts={posts} />`.
3. **E2E spec** — `e2e/article-search.spec.ts` ejercitando el golden path.
4. **Validación local** — `npm run lint`, `npm test`, `npm run test:e2e`.

---

## 7. Definition of done del plan

- [x] Todas las funcionalidades del spec aparecen en contratos
- [x] Cada riesgo tiene una mitigación
- [x] El orden de construcción es claro y sin ciclos
- [x] Test runner E2E decidido (Playwright ya instalado)
- [ ] Confirmado por Bezael → continuar a `tasks.md`
