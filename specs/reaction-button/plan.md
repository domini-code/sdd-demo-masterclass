# Technical Plan — Reaction Button (👍 con contador)

> Derived from `spec.md`. Do not start this file until the spec is confirmed by the user.

---

## 1. Final stack

- **Frontend:** Next.js 15 App Router + React 19 — stack existente del proyecto
- **Backend / API:** API Routes de Next.js — mismo patrón que `/api/bookmarks/route.ts`
- **Database:** Supabase (PostgreSQL) — nueva tabla `reactions` con RLS, índice en `post_id`
- **Authentication:** Supabase Auth vía `createServerClient` — patrón existente en el proyecto
- **Hosting:** mismo que el proyecto (Vercel / local dev) — sin cambios
- **Test runner (unit):** Vitest 2.1.1 — ya instalado en `package.json`, comando `npm test`
- **Test runner (E2E):** no aplica en v1
- **CI:** no aplica en v1

### Discarded stacks

- **Contador en el modelo `Post`:** descartado porque los posts vienen de una fuente estática (WordPress REST / array); mutar ese modelo para reacciones acoplaría dos responsabilidades distintas.
- **Realtime Supabase subscriptions:** descartado para v1 por complejidad innecesaria; React Query con `invalidateQueries` es suficiente.

---

## 2. Data model

- **reactions** — campos: `id uuid PK`, `user_id uuid FK auth.users`, `post_id text`, `created_at timestamptz`. Relación: un usuario tiene muchas reacciones; un post tiene muchas reacciones. Restricción: `UNIQUE(user_id, post_id)`.
- **Post** (existente, sin cambios) — la reacción no se almacena en el modelo de post; se calcula en tiempo de consulta.

Nueva interfaz TypeScript en `app/lib/types.ts`:
```typescript
export interface ReactionState {
  count: number
  userHasReacted: boolean
}
```

---

## 3. Contracts (API + components)

**Backend / API — `/api/reactions/route.ts`:**
- `GET /api/reactions?post_id=<id>` — devuelve `{ count: number, userHasReacted: boolean }`. `userHasReacted: false` si usuario anónimo.
- `POST /api/reactions` — body: `{ post_id: string }`. Requiere auth. Crea reacción. Devuelve 201 o 409 si ya existe.
- `DELETE /api/reactions?post_id=<id>` — Requiere auth. Elimina reacción del usuario. Devuelve `{ success: true }`.

**Frontend / components:**
- `<ReactionButton>` (`app/components/ReactionButton.tsx`) — botón 👍 con contador; props: `postId: string`. Lee estado vía `useReactions`. Si usuario anónimo y hace clic → `router.push('/login')`. Muestra `aria-pressed` y `aria-label` correctos.
- `useReactions` (`app/hooks/use-reactions.ts`) — encapsula `GET`, `POST`, `DELETE`. Actualización optimista idéntica al patrón de `useBookmarks`. Expone: `{ count, userHasReacted, toggleReaction, isPending }`.

**Integración en UI:**
- `PostCard` (`app/components/PostCard.tsx`) — añade `<ReactionButton postId={post.id} />` en el slot `action` junto al botón de bookmark.
- `app/blog/[slug]/page.tsx` — añade `<ReactionButton postId={post.id} />` en la sección de acciones del detalle.

---

## 4. External dependencies

- **@supabase/supabase-js** — consultas a tabla `reactions`. Fallback: mostrar `count: 0` si falla.
- **@tanstack/react-query** — caché y actualización optimista. Fallback: sin caché, fetch directo (degradación aceptable).
- **lucide-react** — icono `ThumbsUp` para el botón. Fallback: emoji 👍 en texto.

---

## 5. Technical risks and mitigations

- **Riesgo:** doble clic rápido crea reacciones duplicadas. **Mitigación:** restricción `UNIQUE(user_id, post_id)` en DB + `isPending` deshabilita el botón durante la mutación.
- **Riesgo:** el contador optimista se desincroniza si falla la red. **Mitigación:** `onError` en la mutación revierte `previousData` usando el patrón de React Query con `onMutate`/`onError`/`onSettled`.
- **Riesgo:** `post_id` en la tabla es `text`; los IDs de posts vienen de una fuente externa (WordPress/static) y podrían cambiar de formato. **Mitigación:** usar siempre `post.id` del tipo `Post` existente; no derivar IDs en el componente.
- **Riesgo:** RLS mal configurada expone reacciones de otros usuarios. **Mitigación:** política RLS explícita: `SELECT` público, `INSERT`/`DELETE` solo para `auth.uid() = user_id`.

---

## 6. Build order

1. **Migración DB + tipos** — primero porque todo lo demás depende de la tabla y del tipo `ReactionState`.
2. **API route `/api/reactions`** — segundo; es el contrato que el hook consume. Testeable de forma aislada.
3. **Hook `useReactions`** — tercero; consume la API, encapsula lógica optimista.
4. **Componente `<ReactionButton>`** — cuarto; consume el hook, sin lógica propia de datos.
5. **Integración en `PostCard` y detalle** — último; conecta todo en la UI final.

---

## 7. Definition of done for the plan

- [x] All features from the spec appear in the data model or contracts
- [x] Every risk has a mitigation
- [x] The build order is clear and has no cycles
- [x] The test runner (Vitest) is decided and justified
- [x] The user has confirmed the stack
