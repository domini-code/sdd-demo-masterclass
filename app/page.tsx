import Link from "next/link"
import { getPosts } from "@/lib/api"
import { SearchablePostList } from "./_components/SearchablePostList"

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

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Últimos artículos</h2>
          <Link href="/blog" className="text-sm text-primary hover:underline">
            Ver todos →
          </Link>
        </div>
        <SearchablePostList posts={posts} />
      </section>
    </div>
  )
}
