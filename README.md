# sdd-demo

Proyecto de demostración brownfield para la **Masterclass de Spec-Driven Development**.

Simula un blog de desarrollo web con autenticación, React Query y Supabase — suficiente complejidad para mostrar cómo SDD resuelve el problema de contexto en proyectos reales.

---

## Stack

- **Next.js 15** App Router + React 19
- **TypeScript** strict
- **Tailwind CSS v4**
- **Supabase** (Auth + DB)
- **TanStack React Query v5**

## Setup

```bash
# 1. Clonar el repo
git clone https://github.com/bezael/sdd-demo
cd sdd-demo

# 2. Instalar dependencias
npm install

# 3. Variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales de Supabase

# 4. Aplicar la migración (si es un proyecto Supabase nuevo)
# supabase db push
# La tabla bookmarks ya está incluida en supabase/migrations/

# 5. Arrancar
npm run dev
```

## Lo que tiene el proyecto (patrones existentes)

| Patrón | Dónde está | Descripción |
|---|---|---|
| Auth hook | `app/hooks/use-user.ts` | `useUser()` → `{ user, isLoading }` |
| React Query hook | `app/hooks/use-posts.ts` | `usePosts()` → `{ posts, isLoading }` |
| Supabase client | `app/lib/supabase/client.ts` | Cliente browser compartido |
| Supabase server | `app/lib/supabase/server.ts` | Cliente server para API routes |
| Button UI | `app/components/ui/button.tsx` | Variantes: `default`, `ghost`, `outline`, `icon` |
| PostCard | `app/components/PostCard.tsx` | Acepta prop `action` para añadir botones |
| API route ejemplo | `app/api/posts/route.ts` | Patrón de respuesta JSON |

## El ticket de demo

La feature de **bookmarks** es el ejercicio de la masterclass:

```
Añadir sistema de bookmarks para artículos

- Botón de bookmark en cada PostCard
- Página /bookmarks con los artículos guardados
- El estado persiste en la DB (tabla bookmarks ya existe)
- No añadir librerías nuevas
```

La tabla `bookmarks` ya está en `supabase/migrations/` — representa el estado "ya aplicado" para el demo.

## Comandos

```bash
npm run dev           # dev server
npm run build         # build de producción
npm run test          # Vitest
npx tsc --noEmit      # type check
```

---

*Repo de demostración para el curso SDD Quickstart — [dominicode.com](https://dominicode.com)*
