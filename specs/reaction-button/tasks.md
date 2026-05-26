# Tasks — Reaction Button (👍 con contador)

> Derived from `spec.md` + `plan.md`. Execute tasks in strict order.
> For each feature: 🔴 failing test → 🟢 minimal implementation → 🔵 refactor (if it adds value).
> If a task reveals something missing in the spec → **go back to the spec first**, don't improvise in code.

---

## Conventions

- **Checkbox** `[ ]` → pending / `[x]` → done
- **Emojis** mark the TDD phase:
  - ⚙️ Setup (no test required)
  - 🔴 Red — write a failing test
  - 🟢 Green — minimal implementation that makes the test pass
  - 🔵 Refactor — cleanup without changing behavior
  - 🔗 Integration — test that crosses modules

---

## Phase 0 — Runner verification

- [x] ⚙️ **Runner verificado:** Vitest 2.1.1 detectado en `package.json`. Comando: `npm test`. No requiere instalación.

---

## Phase 1 — Migración DB + tipos TypeScript

### Feature: tabla `reactions` en Supabase + tipo `ReactionState`

- [ ] ⚙️ **Crear migración SQL** — archivo: `supabase/migrations/<timestamp>_create_reactions_table.sql`.
  Contenido mínimo:
  ```sql
  create table public.reactions (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references auth.users(id) on delete cascade,
    post_id     text not null,
    created_at  timestamptz not null default now(),
    unique(user_id, post_id)
  );
  create index reactions_post_id_idx on public.reactions(post_id);
  alter table public.reactions enable row level security;
  create policy "Lectura pública" on public.reactions for select using (true);
  create policy "Solo el dueño inserta" on public.reactions for insert with check (auth.uid() = user_id);
  create policy "Solo el dueño elimina" on public.reactions for delete using (auth.uid() = user_id);
  ```
  Test: N/A (DDL).

- [ ] 🔴 **Test: tipo `ReactionState` existe y tiene la forma correcta** — archivo: `app/lib/__tests__/types.test.ts`.
  ```typescript
  import type { ReactionState } from "@/lib/types"
  it("ReactionState tiene count y userHasReacted", () => {
    const s: ReactionState = { count: 0, userHasReacted: false }
    expect(s.count).toBe(0)
    expect(s.userHasReacted).toBe(false)
  })
  ```
  Debe FALLAR (el tipo no existe aún).

- [ ] 🟢 **Añadir `ReactionState` a `app/lib/types.ts`** — archivo: `app/lib/types.ts`.
  ```typescript
  export interface ReactionState {
    count: number
    userHasReacted: boolean
  }
  ```
  El test debe pasar.

---

## Phase 2 — API route `/api/reactions`

### Feature: GET — leer contador y estado del usuario

- [ ] 🔴 **Test: GET /api/reactions devuelve `{ count, userHasReacted }`** — archivo: `app/api/reactions/__tests__/route.test.ts`.
  Mockear Supabase client. Verificar:
  - Respuesta 200 con `{ count: number, userHasReacted: boolean }`.
  - `userHasReacted: false` cuando no hay usuario autenticado.
  - `userHasReacted: true` cuando el usuario tiene reacción registrada.
  Debe FALLAR (el archivo `route.ts` no existe aún).

- [ ] 🟢 **Implementar `GET /api/reactions`** — archivo: `app/api/reactions/route.ts`.
  - Recibe `?post_id=<id>`.
  - Consulta `count(*)` de `reactions` donde `post_id = param`.
  - Si hay usuario autenticado, consulta si existe su reacción.
  - Devuelve `{ count, userHasReacted }`.
  El test GET debe pasar.

### Feature: POST — crear reacción

- [ ] 🔴 **Test: POST /api/reactions crea reacción y devuelve 201** — mismo archivo de tests.
  Verificar:
  - 401 si no hay usuario autenticado.
  - 201 con `{ success: true }` si la reacción se crea.
  - 409 si la reacción ya existe (`unique` constraint).
  Debe FALLAR.

- [ ] 🟢 **Implementar `POST /api/reactions`** — `app/api/reactions/route.ts`.
  - Verifica auth; 401 si no hay usuario.
  - Inserta `{ user_id, post_id }` en `reactions`.
  - Captura error de constraint unique → devuelve 409.
  - Devuelve 201 en éxito.
  Los tests POST deben pasar.

### Feature: DELETE — eliminar reacción

- [ ] 🔴 **Test: DELETE /api/reactions elimina reacción** — mismo archivo de tests.
  Verificar:
  - 401 si no hay usuario autenticado.
  - 200 con `{ success: true }` si se elimina.
  Debe FALLAR.

- [ ] 🟢 **Implementar `DELETE /api/reactions`** — `app/api/reactions/route.ts`.
  - Verifica auth; 401 si no hay usuario.
  - Elimina fila donde `user_id = auth.uid() AND post_id = param`.
  - Devuelve `{ success: true }`.
  Los tests DELETE deben pasar.

- [ ] 🔵 **Refactor route** — extraer helpers de Supabase si hay duplicación. Tests siguen en verde.

### Cierre de módulo API

- [ ] 🔗 **Integration test API reactions** — archivo: `app/api/reactions/__tests__/route.integration.test.ts`.
  Verifica que GET + POST + DELETE encadenan correctamente (sin mock de Supabase, contra instancia local si disponible). Si no hay instancia local, marcar como N/A y documentarlo.

---

## Phase 3 — Hook `useReactions`

### Feature: leer estado de reacciones

- [ ] 🔴 **Test: `useReactions` expone `count` y `userHasReacted`** — archivo: `app/hooks/__tests__/use-reactions.test.ts`.
  Usar `renderHook` + mock de `fetch`. Verificar que retorna `{ count, userHasReacted, toggleReaction, isPending }`.
  Debe FALLAR.

- [ ] 🟢 **Implementar `useReactions` (solo lectura)** — archivo: `app/hooks/use-reactions.ts`.
  - `useQuery` con `queryKey: ["reactions", postId]`.
  - Fetch a `GET /api/reactions?post_id=${postId}`.
  - Retorna `{ count, userHasReacted, toggleReaction: undefined, isPending: false }`.
  El test de lectura debe pasar.

### Feature: mutación con actualización optimista

- [ ] 🔴 **Test: `toggleReaction` incrementa el contador optimistamente** — mismo archivo.
  Verificar que al llamar `toggleReaction()`:
  - Si `userHasReacted: false` → `count` sube en 1 de forma inmediata (optimistic).
  - Si `userHasReacted: true` → `count` baja en 1 de forma inmediata.
  - En error → los valores revierten al estado previo.
  Debe FALLAR.

- [ ] 🟢 **Implementar `toggleReaction` con optimistic update** — `app/hooks/use-reactions.ts`.
  Patrón idéntico a `useBookmarks`:
  - `onMutate`: guarda `previousData`, aplica cambio optimista con `queryClient.setQueryData`.
  - `onError`: revierte con `queryClient.setQueryData(key, previousData)`.
  - `onSettled`: `queryClient.invalidateQueries({ queryKey: ["reactions", postId] })`.
  - Si usuario no autenticado (`user` es null): `toggleReaction` hace `router.push('/login')`.
  Los tests de mutación deben pasar.

- [ ] 🔵 **Refactor hook** — extraer la lógica de URL fetch a función pura si hay duplicación.

---

## Phase 4 — Componente `<ReactionButton>`

### Feature: renderizado del botón con contador

- [ ] 🔴 **Test: `<ReactionButton>` renderiza el contador** — archivo: `app/components/__tests__/ReactionButton.test.tsx`.
  Mock de `useReactions` con `{ count: 5, userHasReacted: false }`. Verificar:
  - Renderiza "5" visible.
  - El botón tiene `aria-pressed="false"`.
  - El botón tiene `aria-label` que incluye "Me gusta".
  Debe FALLAR.

- [ ] 🟢 **Implementar `<ReactionButton>` (solo render)** — archivo: `app/components/ReactionButton.tsx`.
  - `"use client"`.
  - Consume `useReactions(postId)`.
  - Muestra icono `ThumbsUp` de lucide-react + `count`.
  - Aplica clase activa cuando `userHasReacted: true`.
  - `aria-pressed`, `aria-label` correctos.
  El test de render debe pasar.

### Feature: interacción — clic en el botón

- [ ] 🔴 **Test: clic en botón llama `toggleReaction`** — mismo archivo.
  Mock de `useReactions` con `toggleReaction: vi.fn()`. Verificar que `fireEvent.click` invoca `toggleReaction`.
  Debe FALLAR.

- [ ] 🟢 **Conectar `onClick` al botón** — `app/components/ReactionButton.tsx`.
  `onClick={() => toggleReaction()}`. `disabled={isPending}`.
  El test de clic debe pasar.

- [ ] 🔵 **Refactor componente** — ajustar estilos Tailwind para estado activo/inactivo/disabled si hay inconsistencias visuales.

---

## Phase 5 — Integración en UI

### Feature: botón en PostCard (listing)

- [ ] 🔴 **Test: `PostCard` con `action` prop renderiza `<ReactionButton>`** — archivo: `app/components/__tests__/PostCard.test.tsx`.
  Verificar que si se pasa `action={<ReactionButton postId="1" />}`, el componente lo renderiza.
  Debe FALLAR si el slot no existe o no se renderiza.

- [ ] 🟢 **Pasar `<ReactionButton>` al slot `action` de `PostCard`** — archivo: `app/blog/page.tsx`.
  ```tsx
  <PostCard post={post} action={<ReactionButton postId={post.id} />} />
  ```
  El test debe pasar.

### Feature: botón en página de detalle

- [ ] ⚙️ **Añadir `<ReactionButton>` en detalle del post** — archivo: `app/blog/[slug]/page.tsx`.
  Renderizar `<ReactionButton postId={post.id} />` junto al `<BookmarkButton>` existente. Test: N/A (layout, verificar visualmente).

### Cierre de integración

- [ ] 🔗 **Integration test end-to-end del flujo principal** — archivo: `app/blog/__tests__/reaction-flow.test.tsx`.
  Mockear API; verificar que un usuario autenticado puede ver el contador en el listing, hacer clic, y el contador cambia optimistamente.

---

## Execution rules

1. **One task at a time.** Do not open two in parallel in the same session.
2. **Before marking 🟢 done:** run `npm test` and verify the corresponding test passes.
3. **Before marking 🔵 done:** run ALL tests and verify they stay green.
4. **If a task reveals ambiguity in the spec:** stop, update `spec.md` and `plan.md`, regenerate affected tasks. Do not improvise in code.
5. **Commits:** one per completed task. Suggested message: `[phase] feat(reactions): description — task #N`.
