# Technical Plan — Búsqueda de artículos en tiempo real

> Derivado de `spec.md` confirmado. Feature slug: `real-time-article-search`.

---

## 1. Stack final

- **Frontend:** Next.js 15 App Router + React 19 + TypeScript strict — ya en el proyecto.
- **Estado:** `useState` de React para el valor del input; `useMemo` para la lista filtrada.
- **Iconos:** `lucide-react` — ya instalada; se usa el icono `Search`.
- **Test runner (unit):** Vitest 2.1.1 — ya disponible. Comando: `npm test`.
- **Test runner (E2E):** Playwright 1.60.0 — ya disponible. Comando: `npm run test:e2e`.

### Stacks descartados

- **React Query:** innecesario — los datos ya están en memoria (no hay fetch del lado del cliente).
- **URL search params:** descartado — el spec no requiere persistencia de búsqueda en URL.
- **Debounce:** descartado — la lista es estática y pequeña; no hay ganancia de rendimiento.

---

## 2. Pasos de implementación

### Paso 1 — Crear `app/_components/ArticleSearch.tsx`

Componente cliente que recibe `Post[]` como prop:
- `useState<string>("")` para el valor del input.
- `useMemo` para calcular `filteredPosts` filtrando por `title` y `excerpt` usando normalización
  de diacríticos.
- Renderiza el input con `aria-label="Buscar artículos"` y el icono `Search` de lucide-react.
- Renderiza el grid de `PostCard` con `filteredPosts`, o el mensaje "No se encontraron artículos"
  si `filteredPosts.length === 0` y hay texto en el input.

### Paso 2 — Modificar `app/page.tsx`

- Cambiar el componente para que pase `posts` completo (no solo `featured`) a `<ArticleSearch>`.
- Mantener `page.tsx` como Server Component.

### Paso 3 — Añadir test E2E `e2e/article-search.spec.ts`

- Test 1 (golden path): navegar a `/`, escribir en el input, verificar que la lista se filtra.
- Test 2 (sin resultados): escribir texto sin coincidencias, verificar mensaje.
- Test 3 (limpiar): filtrar y luego borrar, verificar que vuelven todos los artículos.

---

## 3. Normalización de acentos

```ts
function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
}
```

---

## 4. Riesgos

- Ninguno significativo: el feature es puramente client-side sobre datos estáticos.
