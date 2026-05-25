# Technical Plan — Bookmarks de Artículos

> Derivado de `spec.md` confirmado. Feature slug: `article-bookmarks`.

---

## 1. Stack final

- **Frontend:** Next.js 15 App Router + React 19 + TypeScript strict — ya en el proyecto.
- **Backend / API:** Next.js API routes (`app/api/bookmarks/route.ts`) — patrón existente en `app/api/posts/`.
- **Base de datos:** Supabase Postgres — tabla `bookmarks` ya existe con RLS y los índices necesarios.
- **Autenticación:** Supabase Auth — `useUser` en client components; `createServerClient()` en API routes. Sin cambios.
- **Estado cliente:** TanStack React Query v5 — `useQuery` + `useMutation` con optimistic update. Mismo patrón que `use-posts.ts`.
- **UI:** `app/components/ui/button.tsx` (shadcn/ui) variant `ghost` size `icon` — ya disponible.
- **Test runner (unit):** Vitest 2.1.1 — detectado en `package.json`. Comando: `npm test`. Route A, sin instalación.
- **Test runner (E2E):** no aplica en v1.
- **CI:** no aplica en v1.

### Stacks descartados

- **SWR:** descartado — el proyecto usa React Query de forma consistente; mezclar sería incoherente.
- **Server Actions:** descartado — el proyecto usa API routes para toda la lógica server-side con auth.
- **Zustand / context para bookmarks:** descartado — React Query ya maneja el estado remoto; no se necesita estado global adicional.

---

## 2. Modelo de datos

- **bookmarks** — `id uuid PK`, `user_id uuid FK→auth.users`, `post_id text`, `created_at timestamptz`. Unique(`user_id`, `post_id`). Ya existe en DB con RLS habilitado.
- **Post** (WordPress REST / estático) — `id/slug text`, `title string`, `excerpt string`. No almacenado en Supabase; se obtiene via `app/lib/api.ts`.

Relación: un `User` tiene muchos `bookmarks`; cada `bookmark` referencia un `post_id` externo (no FK a tabla propia).

---

## 3. Contratos

**API — `app/api/bookmarks/route.ts`:**

| Método | Ruta | Descripción | Input | Output |
|--------|------|-------------|-------|--------|
| `GET` | `/api/bookmarks` | Lista los post_id guardados del usuario | — | `{ bookmarks: string[] }` |
| `POST` | `/api/bookmarks` | Guarda un bookmark | `{ post_id: string }` | `201` \| `409 { error }` \| `401 { error }` |
| `DELETE` | `/api/bookmarks?post_id=` | Elimina un bookmark | query param `post_id` | `200` \| `404 { error }` \| `401 { error }` |

**Frontend — componentes:**

| Componente | Ubicación | Responsabilidad |
|------------|-----------|-----------------|
| `BookmarkButton` | `app/blog/[slug]/_components/BookmarkButton.tsx` | Botón toggle con estado visual y optimistic update. Recibe `postId`. |
| `useBookmarks` | `app/hooks/use-bookmarks.ts` | Hook React Query: lista de post_id guardados + mutaciones toggle. |
| `BookmarksPage` | `app/bookmarks/page.tsx` | Server Component. Renderiza lista de artículos guardados o estado vacío. |

---

## 4. Dependencias externas

- **Supabase JS SDK** — ya instalado. Usado para auth server-side en API route y lectura de tabla `bookmarks`.
- **TanStack React Query v5** — ya instalado. Usado en `useBookmarks` para cache y optimistic updates.
- **`app/lib/api.ts`** — función `getPosts()` existente. Usada en `BookmarksPage` para cruzar `post_id` con datos de posts.

---

## 5. Riesgos técnicos y mitigaciones

- **Riesgo:** `post_id` en `bookmarks` es `text` — si se usara el slug y este cambiara, el bookmark quedaría huérfano. **Mitigación:** se usa el `id` numérico del post (WordPress post ID). Decisión confirmada por Bezael. Requiere que `getPosts()` exponga el campo `id`.
- **Riesgo:** La página `/bookmarks` necesita cruzar los `post_id` de Supabase con los datos de posts — dos fuentes distintas. **Mitigación:** `BookmarksPage` como Server Component hace las dos llamadas en paralelo (`Promise.all`) y filtra los posts cuyos ids están en los bookmarks.
- **Riesgo:** Optimistic update desincronizado si el usuario hace doble clic rápido. **Mitigación:** deshabilitar el botón mientras la mutación está `isPending`.
- **Riesgo:** RLS mal configurado podría exponer bookmarks de otros usuarios. **Mitigación:** la policy existente usa `auth.uid() = user_id`; la API route verifica session antes de cualquier query.
- **Riesgo:** `GET /api/bookmarks` podría devolver una lista grande si el usuario tiene muchos bookmarks. **Mitigación:** aceptable en v1 dado el volumen esperado; añadir paginación solo si hay evidencia de problema.

---

## 6. Orden de construcción

1. **API route** (`app/api/bookmarks/route.ts`) — primero porque es la base que necesitan el hook y la página. Testeable en aislamiento.
2. **Hook `useBookmarks`** (`app/hooks/use-bookmarks.ts`) — segundo; depende de la API. Incluye optimistic update.
3. **`BookmarkButton`** (`app/blog/[slug]/_components/`) — tercero; depende del hook. UI del toggle.
4. **`BookmarksPage`** (`app/bookmarks/page.tsx`) — último; depende de API + datos de posts. Cierra el flujo completo.

---

## 7. Definition of done del plan

- [x] Todas las funcionalidades del spec aparecen en contratos o modelo de datos
- [x] Cada riesgo tiene una mitigación
- [x] El orden de construcción es claro y sin ciclos
- [x] Test runner decidido y verificado (Vitest 2.1.1, Route A)
- [ ] Confirmado por Bezael → continuar a `tasks.md`
