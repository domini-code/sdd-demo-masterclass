# Tasks — Bookmarks de Artículos

> Derivado de `spec.md` + `plan.md` confirmados.
> `post_id` = id numérico del post (WordPress post ID).
> Ejecutar en orden estricto. Un task a la vez.
> Si un task revela algo ausente en el spec → actualizar `spec.md` primero, luego continuar.

---

## Convenciones

- `[ ]` pendiente · `[x]` hecho
- ⚙️ Setup · 🔴 Red (test falla) · 🟢 Green (implementación mínima) · 🔵 Refactor · 🔗 Integración

---

## Phase 0 — Verificación del runner

- [x] ⚙️ **Runner verificado:** Vitest 2.1.1 detectado en `package.json`. Comando: `npm test`. Sin instalación requerida.
- [ ] ⚙️ **Confirmar ejecución limpia** — correr `npm test` en el repo actual. Debe completar sin errores (puede no haber tests aún). Archivos: ninguno.

---

## Phase 1 — API route `/api/bookmarks`

### Feature: GET — listar post_id guardados del usuario

- [ ] 🔴 **Test: GET devuelve 401 si no hay sesión**
  - Archivo: `app/api/bookmarks/__tests__/route.test.ts`
  - Mock: `@/lib/supabase/server` → `getUser()` retorna `{ data: { user: null } }`
  - Criterio: `spec.md §3 → "El sistema rechaza con 401 cualquier petición sin sesión activa"`
  - El test debe **fallar** al crearse (la ruta no existe aún).

- [ ] 🟢 **Implementar GET con auth check**
  - Archivo: `app/api/bookmarks/route.ts`
  - Crear el handler `GET`: obtener user con `createServerClient()`, devolver `401` si no hay sesión. Solo lo que hace pasar el test.

- [ ] 🔴 **Test: GET devuelve `{ bookmarks: string[] }` para usuario autenticado**
  - Archivo: `app/api/bookmarks/__tests__/route.test.ts`
  - Mock: `getUser()` retorna usuario válido; `supabase.from('bookmarks').select()` retorna `[{ post_id: '42' }]`
  - Criterio: `spec.md §3 → "El sistema permite obtener los post_id guardados"`
  - Verificar shape exacto: `{ bookmarks: ['42'] }`

- [ ] 🟢 **Implementar GET completo**
  - Archivo: `app/api/bookmarks/route.ts`
  - Query a Supabase filtrando por `user_id`, devolver `{ bookmarks: string[] }`.

### Feature: POST — guardar bookmark

- [ ] 🔴 **Test: POST devuelve 401 si no hay sesión**
  - Archivo: `app/api/bookmarks/__tests__/route.test.ts`
  - Mismo mock de sesión nula aplicado a `POST`.
  - Criterio: `spec.md §3 → "401 sin sesión activa"`

- [ ] 🔴 **Test: POST devuelve 201 al guardar un bookmark válido**
  - Archivo: `app/api/bookmarks/__tests__/route.test.ts`
  - Mock: usuario autenticado; `insert()` retorna `{ error: null }`
  - Body: `{ post_id: '42' }`
  - Criterio: `spec.md §3 → "El sistema permite guardar un bookmark"`

- [ ] 🔴 **Test: POST devuelve 409 si el bookmark ya existe**
  - Archivo: `app/api/bookmarks/__tests__/route.test.ts`
  - Mock: `insert()` retorna `{ error: { code: '23505' } }` (unique violation Postgres)
  - Criterio: `spec.md §3 → "El sistema rechaza con 409 un bookmark duplicado"`

- [ ] 🟢 **Implementar POST completo**
  - Archivo: `app/api/bookmarks/route.ts`
  - Validar `post_id` presente en body; insertar; mapear error `23505` → `409`.

### Feature: DELETE — eliminar bookmark

- [ ] 🔴 **Test: DELETE devuelve 401 si no hay sesión**
  - Archivo: `app/api/bookmarks/__tests__/route.test.ts`

- [ ] 🔴 **Test: DELETE devuelve 200 al eliminar bookmark existente**
  - Archivo: `app/api/bookmarks/__tests__/route.test.ts`
  - Mock: usuario autenticado; `delete().eq()` retorna `{ error: null, count: 1 }`
  - Query param: `?post_id=42`
  - Criterio: `spec.md §3 → "El sistema permite eliminar un bookmark"`

- [ ] 🔴 **Test: DELETE devuelve 404 si el bookmark no existe**
  - Archivo: `app/api/bookmarks/__tests__/route.test.ts`
  - Mock: `delete().eq()` retorna `{ error: null, count: 0 }`
  - Criterio: `spec.md §3 → "404 { error }" en contratos`

- [ ] 🟢 **Implementar DELETE completo**
  - Archivo: `app/api/bookmarks/route.ts`
  - Leer `post_id` del query param; delete filtrando por `user_id` y `post_id`; mapear `count === 0` → 404.

- [ ] 🔵 **Refactor API route**
  - Archivo: `app/api/bookmarks/route.ts`
  - Extraer helper de auth check si los tres handlers repiten el patrón. Solo si mejora claridad. Tests deben quedar verdes.

### Cierre Phase 1

- [ ] 🔗 **Correr `npm test` — todos los tests de la ruta en verde.**

---

## Phase 2 — Hook `useBookmarks`

### Feature: consultar bookmarks del usuario

- [ ] 🔴 **Test: useBookmarks devuelve lista de post_id**
  - Archivo: `app/hooks/__tests__/use-bookmarks.test.ts`
  - Setup: `renderHook` con `QueryClientProvider`; mock de `fetch` que retorna `{ bookmarks: ['42'] }`
  - Criterio: `spec.md §3 → "El sistema permite obtener los post_id guardados"`
  - Verificar: `result.current.bookmarks` contiene `'42'`.

- [ ] 🔴 **Test: useBookmarks expone `isBookmarked(postId)` helper**
  - Archivo: `app/hooks/__tests__/use-bookmarks.test.ts`
  - Verificar: `isBookmarked('42')` → `true`; `isBookmarked('99')` → `false`.
  - Criterio: `spec.md §3 → "El sistema muestra el estado visual del botón"`

- [ ] 🟢 **Implementar useBookmarks con useQuery**
  - Archivo: `app/hooks/use-bookmarks.ts`
  - `queryKey: ['bookmarks']`; fetch a `GET /api/bookmarks`; exponer `bookmarks: string[]` e `isBookmarked(postId: string): boolean`.

### Feature: toggle bookmark con optimistic update

- [ ] 🔴 **Test: toggleBookmark llama POST cuando el post NO está guardado**
  - Archivo: `app/hooks/__tests__/use-bookmarks.test.ts`
  - Mock fetch POST; verificar que se llama con `{ post_id: '42' }`.
  - Criterio: `spec.md §3 → "El sistema permite guardar un bookmark"`

- [ ] 🔴 **Test: toggleBookmark llama DELETE cuando el post YA está guardado**
  - Archivo: `app/hooks/__tests__/use-bookmarks.test.ts`
  - Mock fetch DELETE; verificar que se llama con query param `?post_id=42`.
  - Criterio: `spec.md §3 → "El usuario puede desmarcar un artículo guardado"`

- [ ] 🔴 **Test: optimistic update — bookmarks se actualiza antes de que el fetch resuelva**
  - Archivo: `app/hooks/__tests__/use-bookmarks.test.ts`
  - Usar `waitFor` para verificar que el estado cambia antes de que el mock de fetch resuelva.
  - Criterio: `spec.md §3 → "El sistema aplica optimistic update"`

- [ ] 🔴 **Test: rollback — si el fetch falla, bookmarks vuelve al estado anterior**
  - Archivo: `app/hooks/__tests__/use-bookmarks.test.ts`
  - Mock fetch que rechaza; verificar que `bookmarks` revierte.
  - Criterio: `spec.md §4 → "Error de red: el botón revierte al estado anterior"`

- [ ] 🟢 **Implementar toggleBookmark con useMutation y optimistic update**
  - Archivo: `app/hooks/use-bookmarks.ts`
  - `onMutate`: snapshot del cache + update optimista.
  - `onError`: restaurar snapshot.
  - `onSettled`: `invalidateQueries({ queryKey: ['bookmarks'] })`.

### Cierre Phase 2

- [ ] 🔗 **Correr `npm test` — todos los tests del hook en verde.**

---

## Phase 3 — Componente `BookmarkButton`

### Feature: botón toggle con estado visual

- [ ] ⚙️ **Crear archivo del componente**
  - Archivo: `app/blog/[slug]/_components/BookmarkButton.tsx`
  - Añadir `"use client"` y estructura mínima que compila. Sin lógica aún.

- [ ] 🔴 **Test: renderiza ícono "no guardado" cuando el post no está en bookmarks**
  - Archivo: `app/blog/[slug]/_components/__tests__/BookmarkButton.test.tsx`
  - Mock `useBookmarks` → `isBookmarked()` retorna `false`.
  - Verificar: `aria-label="Guardar artículo"` presente.
  - Criterio: `spec.md §3 → "El sistema muestra el estado visual del botón"`

- [ ] 🔴 **Test: renderiza ícono "guardado" cuando el post está en bookmarks**
  - Archivo: `app/blog/[slug]/_components/__tests__/BookmarkButton.test.tsx`
  - Mock `useBookmarks` → `isBookmarked()` retorna `true`.
  - Verificar: `aria-label="Eliminar de guardados"` presente.
  - Criterio: `spec.md §6 → "aria-label dinámico"`

- [ ] 🔴 **Test: el botón está deshabilitado mientras isPending es true**
  - Archivo: `app/blog/[slug]/_components/__tests__/BookmarkButton.test.tsx`
  - Mock `useBookmarks` → `isPending: true`.
  - Verificar: botón tiene atributo `disabled`.
  - Criterio: `plan.md §5 → "deshabilitar botón mientras la mutación está isPending"`

- [ ] 🔴 **Test: hacer clic llama toggleBookmark con el postId correcto**
  - Archivo: `app/blog/[slug]/_components/__tests__/BookmarkButton.test.tsx`
  - Mock `toggleBookmark` como `vi.fn()`; prop `postId="42"`.
  - Verificar: `fireEvent.click` → `toggleBookmark` llamado con `'42'`.
  - Criterio: `spec.md §4 Flujo Guardar → paso 3`

- [ ] 🔴 **Test: usuario no autenticado — clic muestra toast sin llamar toggleBookmark**
  - Archivo: `app/blog/[slug]/_components/__tests__/BookmarkButton.test.tsx`
  - Mock `useUser` → `user: null`; mock `useToast`.
  - Verificar: `toggleBookmark` NO llamado; toast disparado con mensaje de login.
  - Criterio: `spec.md §4 Flujo Usuario anónimo`

- [ ] 🟢 **Implementar BookmarkButton completo**
  - Archivo: `app/blog/[slug]/_components/BookmarkButton.tsx`
  - Props: `postId: string`.
  - Usar `useUser`, `useBookmarks`, `useToast`.
  - `Button` variant `ghost` size `icon` con ícono condicional (`lucide-react`: `Bookmark` / `BookmarkCheck`).
  - Guard para usuario anónimo con toast: `"Inicia sesión para guardar artículos"`.
  - `disabled={isPending}`.

- [ ] 🔵 **Refactor: extraer guard de usuario anónimo si supera 3 líneas**
  - Solo si mejora legibilidad. Tests deben quedar verdes.

### Cierre Phase 3

- [ ] ⚙️ **Integrar BookmarkButton en `app/blog/[slug]/page.tsx`**
  - Pasar el `id` numérico del post como prop `postId` (verificar que `getPosts()` lo expone).
  - Verificar compilación: `npx tsc --noEmit`.

- [ ] 🔗 **Correr `npm test` — todos los tests del componente en verde.**

---

## Phase 4 — Página `/bookmarks`

### Feature: lista de artículos guardados

- [ ] ⚙️ **Crear archivo de página**
  - Archivo: `app/bookmarks/page.tsx`
  - Server Component. Estructura mínima que compila.

- [ ] 🔴 **Test: renderiza lista cuando hay bookmarks**
  - Archivo: `app/bookmarks/__tests__/page.test.tsx`
  - Mock: `GET /api/bookmarks` retorna `['42']`; `getPosts()` retorna post con `id: 42`.
  - Verificar: título del post visible en el DOM; enlace a `/blog/[slug]` presente.
  - Criterio: `spec.md §3 → "El usuario puede ver todos sus artículos guardados"`

- [ ] 🔴 **Test: renderiza estado vacío cuando no hay bookmarks**
  - Archivo: `app/bookmarks/__tests__/page.test.tsx`
  - Mock: `GET /api/bookmarks` retorna `[]`.
  - Verificar: mensaje de estado vacío visible; enlace a `/blog` presente.
  - Criterio: `spec.md §3 → "El sistema muestra un estado vacío"`

- [ ] 🟢 **Implementar BookmarksPage**
  - Archivo: `app/bookmarks/page.tsx`
  - `Promise.all([fetch('/api/bookmarks'), getPosts()])` para obtener ambas fuentes en paralelo.
  - Filtrar posts cuyo `id` (como string) esté en la lista de bookmarks.
  - Renderizar lista o estado vacío según resultado.
  - Solo título, descripción y enlace — sin imagen ni fecha. (`spec.md §3`)

### Feature: redirección si no autenticado

- [ ] 🔴 **Test: redirige a `/` si el usuario no está autenticado**
  - Archivo: `app/bookmarks/__tests__/page.test.tsx`
  - Mock: `GET /api/bookmarks` retorna `401`.
  - Verificar: `redirect('/')` llamado.
  - Criterio: `spec.md §3 → "El sistema redirige al home si el usuario no está autenticado"`

- [ ] 🟢 **Implementar redirect en BookmarksPage**
  - Archivo: `app/bookmarks/page.tsx`
  - Si la respuesta de `/api/bookmarks` es 401, llamar `redirect('/')` de `next/navigation`.

### Cierre Phase 4

- [ ] 🔗 **Correr `npm test` — suite completa en verde.**
- [ ] ⚙️ **Verificar types:** `npx tsc --noEmit` sin errores.
- [ ] ⚙️ **Verificar lint:** `npm run lint` sin errores.

---

## Reglas de ejecución

1. Un task a la vez. No abrir dos en paralelo.
2. Antes de marcar 🟢 hecho: correr `npm test` y verificar que el test correspondiente pasa.
3. Antes de marcar 🔵 hecho: correr `npm test` completo y verificar que todos siguen en verde.
4. Si un task revela ambigüedad en el spec: parar, actualizar `spec.md` y `plan.md`, regenerar los tasks afectados.
5. Commits: uno por task completado. Mensaje sugerido: `[phaseN] feat(bookmarks): descripción — task #N`.
