import type { Post } from "@/lib/types"

const POSTS: Post[] = [
  {
    id: "1",
    slug: "spec-driven-development-brownfield",
    title: "Cómo usar SDD en proyectos que ya existen",
    excerpt: "El mayor error al usar IA en proyectos reales no es el modelo — es no darle contexto antes de que genere.",
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    publishedAt: "2025-05-10",
    readingTime: 8,
    tags: ["sdd", "claude", "ia"],
  },
  {
    id: "2",
    slug: "react-query-patrones-avanzados",
    title: "Patrones avanzados de React Query que uso en producción",
    excerpt: "Optimistic updates, infinite queries y cómo estructuro los hooks para que sean testeables.",
    coverImage: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800",
    publishedAt: "2025-04-22",
    readingTime: 12,
    tags: ["react", "react-query", "typescript"],
  },
  {
    id: "3",
    slug: "supabase-auth-nextjs-app-router",
    title: "Supabase Auth con Next.js App Router: la guía completa",
    excerpt: "Server Components, middleware, cookies de sesión — todo lo que necesitas para auth en producción.",
    coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800",
    publishedAt: "2025-03-15",
    readingTime: 15,
    tags: ["supabase", "nextjs", "auth"],
  },
  {
    id: "4",
    slug: "typescript-strict-buenas-practicas",
    title: "TypeScript strict: las reglas que cambiaron cómo escribo código",
    excerpt: "No es solo activar strict mode — es entender por qué cada regla existe y qué errores previene.",
    coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
    publishedAt: "2025-02-28",
    readingTime: 10,
    tags: ["typescript"],
  },
  {
    id: "5",
    slug: "vitest-testing-react-hooks",
    title: "Testing de React hooks con Vitest: mocks, setup y casos edge",
    excerpt: "Cómo testear hooks que usan React Query, autenticación y llamadas a API sin montar el componente entero.",
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
    publishedAt: "2025-01-20",
    readingTime: 9,
    tags: ["testing", "vitest", "react"],
  },
]

export async function getPosts(): Promise<Post[]> {
  return POSTS
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  return POSTS.find((p) => p.slug === slug)
}

export async function getPostById(id: string): Promise<Post | undefined> {
  return POSTS.find((p) => p.id === id)
}
