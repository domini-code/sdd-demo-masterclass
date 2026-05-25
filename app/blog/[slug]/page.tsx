import { notFound } from "next/navigation"
import Image from "next/image"
import { getPostBySlug, getPosts } from "@/lib/api"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return { title: `${post.title} — DevDiario`, description: post.excerpt }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  return (
    <article className="mx-auto max-w-2xl">
      <header className="mb-8">
        <div className="mb-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="mb-4 text-3xl font-bold leading-tight text-foreground">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            {new Date(post.publishedAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span>·</span>
          <span>{post.readingTime} min de lectura</span>
        </div>
      </header>

      <div className="relative mb-8 h-64 w-full overflow-hidden rounded-xl">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="prose prose-neutral max-w-none dark:prose-invert">
        <p className="lead">{post.excerpt}</p>
        <p>
          Este es un artículo de demostración para el repo <strong>sdd-demo</strong>.
          El contenido real iría aquí, cargado desde una CMS o archivos Markdown.
        </p>
      </div>
    </article>
  )
}
