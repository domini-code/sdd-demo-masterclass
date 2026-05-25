# Spec — Bookmarks de Artículos

> Dominicode Spec-First template (Bezael Pérez).
> Feature slug: `article-bookmarks`

---

## SECTION 1 — Visión del Producto

Los usuarios autenticados pueden guardar artículos del blog para leerlos después,
y consultarlos en cualquier momento desde su página personal de guardados (`/bookmarks`).

---

## SECTION 2 — Usuarios y Casos de Uso

**Usuario autenticado:** guardar un artículo, eliminar un artículo guardado, consultar todos sus artículos guardados.

**Usuario anónimo:** intenta guardar un artículo — el sistema le indica que debe autenticarse, sin realizar ninguna petición a la API.

---

## SECTION 3 — Funcionalidades

**Módulo: Bookmark Toggle (botón en posts)**
- El usuario puede marcar un artículo como guardado **únicamente desde la página de detalle** (`/blog/[slug]`).
- El usuario puede desmarcar un artículo guardado (toggle) desde esa misma página.
- El sistema muestra el estado visual del botón (guardado / no guardado) según el estado actual en DB.
- El sistema aplica optimistic update: el botón responde visualmente antes de que la API confirme.

**Módulo: Página de Guardados (`/bookmarks`)**
- El usuario puede ver todos sus artículos guardados en una lista con título, descripción y enlace (sin imagen ni fecha).
- El usuario puede eliminar un bookmark directamente desde la lista.
- El sistema muestra un estado vacío con mensaje y enlace a `/blog` cuando no hay bookmarks.
- El sistema redirige al home si el usuario no está autenticado.

**Módulo: API de Bookmarks (`/api/bookmarks`)**
- El sistema permite obtener los post_id guardados del usuario autenticado (`GET`).
- El sistema permite guardar un bookmark (`POST`) para el usuario autenticado.
- El sistema permite eliminar un bookmark (`DELETE`) para el usuario autenticado.
- El sistema rechaza con 401 cualquier petición sin sesión activa.
- El sistema rechaza con 409 un intento de guardar un bookmark duplicado.

---

## SECTION 4 — Flujos de Usuario

**Flujo — Guardar un artículo:**
1. El usuario autenticado visita `/blog/[slug]`.
2. El usuario hace clic en el botón de bookmark (ícono de marcador vacío).
3. El botón cambia visualmente a "guardado" de forma inmediata (optimistic update).
4. El sistema envía `POST /api/bookmarks` con `{ post_id }`.
5. La API verifica sesión, inserta en `bookmarks` y devuelve `201`.
- **Error de red o servidor:** el botón revierte al estado "no guardado" y se muestra un toast de error.
- **Error duplicado (409):** el sistema ignora el error silenciosamente (ya estaba guardado).

**Flujo — Eliminar un bookmark (desde post):**
1. El usuario visita `/blog/[slug]` con el artículo ya guardado.
2. El usuario hace clic en el botón de bookmark que está en estado "guardado".
3. El botón cambia visualmente a "no guardado" de forma inmediata (optimistic update).
4. El sistema envía `DELETE /api/bookmarks?post_id=[id]`.
5. La API verifica sesión, elimina el registro y devuelve `200`.
- **Error de red o servidor:** el botón revierte al estado "guardado" y se muestra un toast de error.

**Flujo — Consultar página de guardados:**
1. El usuario autenticado navega a `/bookmarks`.
2. El sistema consulta `GET /api/bookmarks` y obtiene la lista de `post_id`.
3. La página combina los post_id con los datos de posts (título, descripción, slug).
4. Se renderiza la lista con un enlace a `/blog/[slug]` por cada artículo.
- **Error vacío:** si no hay bookmarks, se muestra estado vacío con CTA a `/blog`.
- **Error no autenticado:** el sistema redirige a `/`.

**Flujo — Usuario anónimo intenta guardar:**
1. El usuario anónimo ve el botón de bookmark en un post.
2. El usuario hace clic en el botón.
3. El sistema muestra un toast: "Inicia sesión para guardar artículos".
4. No se realiza ninguna petición a la API.

---

## SECTION 5 — Arquitectura

Stack definido por el proyecto existente — no se introduce ningún cambio de stack.

- **Frontend:** Next.js 15 App Router + React 19 + TypeScript (strict)
- **Backend/API:** Next.js API routes en `app/api/bookmarks/route.ts`
- **Base de datos:** Supabase Postgres — tabla `bookmarks` ya existe con RLS habilitado
- **Autenticación:** Supabase Auth — `useUser` hook en client components; `createServerClient()` en API routes
- **Estado cliente:** TanStack React Query v5 — hook `useBookmarks` con `useQuery` + `useMutation`
- **UI:** `app/components/ui/button.tsx` (shadcn/ui) — variant `ghost`, size `icon`
- **Hosting:** el que ya usa el proyecto

---

## SECTION 6 — Non-Functional Requirements

- **Performance:** respuesta de API < 500ms; optimistic update en el toggle para feedback inmediato sin esperar la red.
- **Seguridad:** RLS en `bookmarks` ya habilitado — cada usuario solo accede a sus registros. Auth verificada server-side en cada route handler antes de tocar la DB.
- **Escalabilidad:** índices en `user_id` y `post_id` ya presentes en la migración. Diseñado para el volumen actual del blog.
- **Idioma:** español — todos los textos visibles al usuario (toasts, estados vacíos, aria-labels) en español.
- **Accesibilidad:** botón de bookmark con `aria-label` dinámico ("Guardar artículo" / "Eliminar de guardados").
- **Dependencias:** cero librerías nuevas — se usan exclusivamente las ya instaladas en el proyecto.

---

## Preguntas abiertas

- [x] ¿La página `/bookmarks` debe mostrar los metadatos del post (imagen, fecha)? — **Resuelto:** solo título + descripción + enlace, sin imagen ni fecha.
- [x] ¿El botón de bookmark aparece en `/blog` (listado)? — **Resuelto:** no. Solo en `/blog/[slug]` (detalle).

---

*Cuando todas las secciones estén cerradas y las preguntas abiertas resueltas (o diferidas explícitamente), continuar a `plan.md`.*
