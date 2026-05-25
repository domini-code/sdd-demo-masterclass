# CLAUDE.md

## Commands

```bash
npm run dev           # dev server
npm run build         # production build
npm run test          # Vitest single run
npm run test:watch    # Vitest watch mode
npm run lint          # ESLint
npx tsc --noEmit      # type check
```

## Architecture

**Stack:** Next.js 15 App Router + React 19 + TypeScript (strict) + Tailwind CSS v4

**Auth:** Supabase Auth. El usuario autenticado se obtiene siempre via hook `useUser` en client components (`app/hooks/use-user.ts`), o via `createServerClient` en Server Components y API routes.

**State & data:** TanStack React Query v5 para estado cliente. `await fetch()` directo en Server Components.

**Path alias:** `@/*` → `./app/*`

### Key Directories

```
app/
├── api/              # API routes (route.ts). Auth siempre server-side.
├── components/
│   └── ui/           # Wrappers de Radix UI — usar estos, no Radix directo
├── hooks/            # Custom hooks. Todos usan React Query.
├── lib/
│   ├── types.ts      # Interfaces TypeScript compartidas
│   ├── api.ts        # Fetch de posts (WordPress REST o static)
│   └── supabase/
│       ├── client.ts # Cliente browser — usar en hooks y client components
│       └── server.ts # Cliente server — usar en API routes y Server Components
└── [route]/
    └── _components/  # Componentes específicos de esa ruta
```

### Component Patterns

- **"use client":** Solo donde hay interactividad o hooks de browser. Default: Server Component.
- **Forms:** React Hook Form + Zod. Validar en cliente Y en API route.
- **UI primitives:** Usar `app/components/ui/` — no importar Radix directamente.

### Auth pattern — API routes

```typescript
// Siempre obtener el usuario server-side en cada route handler
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 })
  // ...
}
```

### React Query pattern — hooks

```typescript
// Patrón base que siguen todos los hooks del proyecto
export function useNombreHook(param: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["nombre", param],
    queryFn: () => fetch(`/api/nombre?param=${param}`).then(r => r.json()),
  })
  const mutation = useMutation({
    mutationFn: (body) => fetch("/api/nombre", { method: "POST", body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nombre"] }),
  })
  return { data, isLoading, accion: mutation.mutate }
}
```

### Styling

Tailwind CSS v4. Dark mode via clase `dark` en `<html>`.

## Important Notes

- **Locale:** Sitio en español. Copy y metadata en español.
- **Specs:** Planes en `specs/` como archivos `.md`.
- **Error responses en API:** `{ error: string }` con el status HTTP correspondiente.
- **Console logs:** Solo `console.error` para errores que deben sobrevivir en producción.
