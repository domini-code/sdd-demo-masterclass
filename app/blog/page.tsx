import { getPosts } from "@/lib/api"
import { PostCard } from "@/components/PostCard"

export const metadata = {
  title: "Blog — DevDiario",
  description: "Todos los artículos de DevDiario sobre desarrollo web moderno.",
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-foreground">Blog</h1>
      <p className="mb-10 text-muted-foreground">
        {posts.length} artículos sobre Next.js, TypeScript, Supabase y más.
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
