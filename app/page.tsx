import { getPosts } from "@/lib/api"
import { ArticleSearch } from "@/_components/ArticleSearch"

export default async function HomePage() {
  const posts = await getPosts()

  return (
    <div>
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
          Artículos de desarrollo web
        </h1>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
          Tutoriales prácticos sobre Next.js, TypeScript, Supabase y herramientas de IA para desarrolladores.
        </p>
      </section>

      <ArticleSearch posts={posts} />
    </div>
  )
}
