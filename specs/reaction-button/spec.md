# Spec — Reaction Button (👍 con contador)

> Dominicode Spec-First template (Bezael Pérez).
> Fill each section **in order**. Do not move to `plan.md` until all 6 sections are closed.

---

## SECTION 1 — Product Vision

**Vision:**
Permitir que los usuarios autenticados reaccionen con 👍 a cualquier post del blog, mostrando un contador público del total de reacciones para todos los visitantes.

---

## SECTION 2 — Users and Use Cases

**Usuario autenticado:** ver el contador de reacciones de un post, dar 👍 a un post, quitar su 👍 de un post.

**Usuario anónimo (visitante):** ver el contador de reacciones de un post. No puede reaccionar sin iniciar sesión.

---

## SECTION 3 — Features

**Módulo Reacciones — Lectura:**
- El usuario puede ver el conteo total de reacciones 👍 en la tarjeta de cada post (PostCard).
- El usuario puede ver el conteo total de reacciones 👍 en la página de detalle del post.
- El sistema muestra si el usuario autenticado ya reaccionó al post (estado activo/inactivo del botón).

**Módulo Reacciones — Escritura:**
- El usuario autenticado puede dar 👍 a un post (añadir reacción).
- El usuario autenticado puede quitar su 👍 de un post (eliminar reacción).
- El sistema aplica actualización optimista: el contador cambia visualmente de forma inmediata antes de que responda el servidor.
- El sistema revierte el cambio optimista si la petición falla.

**Módulo Reacciones — Acceso:**
- El sistema permite a usuarios anónimos ver el contador pero desactiva el botón de reacción.
- [NEEDS CONFIRMATION: ¿El botón para anónimos redirige a /login o simplemente muestra un tooltip "Inicia sesión para reaccionar"?]

---

## SECTION 4 — User Flows

**Flow — Usuario autenticado da 👍 por primera vez:**
1. El usuario visita la página de un post (listing o detalle).
2. El sistema muestra el botón 👍 con el contador actual (estado inactivo).
3. El usuario hace clic en el botón.
4. El sistema aplica actualización optimista: incrementa el contador en 1 y activa el botón visualmente.
5. El sistema llama `POST /api/reactions` con `post_id`.
6. El servidor confirma la creación; el estado queda sincronizado.
- **Error:** si la petición falla, el sistema revierte el contador y el estado del botón al valor anterior, y muestra un toast de error.

**Flow — Usuario autenticado quita su 👍:**
1. El usuario ve el botón 👍 en estado activo (ya reaccionó).
2. El usuario hace clic en el botón.
3. El sistema aplica actualización optimista: decrementa el contador en 1 y desactiva el botón.
4. El sistema llama `DELETE /api/reactions?post_id=<id>`.
5. El servidor confirma la eliminación; el estado queda sincronizado.
- **Error:** si la petición falla, el sistema revierte al estado activo con el contador anterior y muestra un toast de error.

**Flow — Usuario anónimo intenta reaccionar:**
1. El visitante ve el botón 👍 con el contador (estado deshabilitado/opaco).
2. El visitante hace clic en el botón.
3. [NEEDS CONFIRMATION: Redirigir a /login o mostrar tooltip/modal "Inicia sesión para reaccionar".]
- **Error:** no aplica (el botón está deshabilitado o redirige).

**Flow — Carga inicial del contador:**
1. El usuario entra a `/blog` o `/blog/[slug]`.
2. El sistema carga los datos de reacciones vía React Query (`GET /api/reactions?post_id=<id>`).
3. El sistema muestra el contador con el valor del servidor y el estado correcto del botón.
- **Error:** si la API falla, el sistema muestra `0` como fallback y registra el error en consola (`console.error`).

---

## SECTION 5 — Architecture

Stack ya definido por el proyecto existente:

- **Frontend:** Next.js 15 App Router + React 19 — existente en el proyecto
- **Backend / API:** API Routes de Next.js — mismo patrón que `/api/bookmarks`
- **Database:** Supabase (PostgreSQL) — nueva tabla `reactions`, mismo patrón que `bookmarks`
- **Authentication:** Supabase Auth vía `createServerClient` — patrón existente
- **Hosting:** mismo que el proyecto actual (Vercel / local dev)
- **Integrations:** ninguna nueva

---

## SECTION 6 — Non-functional Requirements

- **Performance:** respuesta de API < 500 ms; actualización optimista garantiza 0 ms de latencia percibida en UI.
- **Security:** cada usuario solo puede crear/eliminar sus propias reacciones; RLS en Supabase (`user_id = auth.uid()`); restricción `UNIQUE(user_id, post_id)` en DB.
- **Scalability:** diseñado para v1 del blog; el contador usa `COUNT` de Supabase, escalable con índice en `post_id`.
- **Language:** español — copy del botón e indicadores en español ("Reaccionar", tooltip "Ya reaccionaste").
- **Accessibility:** botón con `aria-label` descriptivo ("Me gusta este post", "Quitar me gusta"); estado `aria-pressed` refleja si el usuario ya reaccionó.
- **Compliance:** no se almacena PII adicional; solo `user_id` (UUID) y `post_id`.

---

## Open questions

- [ ] ¿El botón para usuarios anónimos redirige a `/login` o muestra un tooltip? — owner: Bezael, deadline: antes de implementar
- [ ] ¿El botón 👍 aparece en la tarjeta del listing (`PostCard`) además de la página de detalle? — owner: Bezael, deadline: antes de implementar

---

*When all sections are closed and open questions resolved (or explicitly deferred), move to `plan.md`.*
