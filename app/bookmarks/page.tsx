import { redirect } from "next/navigation"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { getPosts } from "@/lib/api"

export default async function BookmarksPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/")

  const [{ data }, allPosts] = await Promise.all([
    supabase.from("bookmarks").select("post_id").eq("user_id", user.id),
    getPosts(),
  ])

  const bookmarks = (data ?? []).map((b: { post_id: string }) => b.post_id)
  const savedPosts = allPosts.filter((p) => bookmarks.includes(p.id))

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Mis artículos guardados</h1>

      {savedPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="mb-4 text-muted-foreground">No tienes artículos guardados todavía.</p>
          <Link href="/blog" className="text-primary hover:underline">
            Ir al blog
          </Link>
        </div>
      ) : (
        <ul className="space-y-6">
          {savedPosts.map((post) => (
            <li key={post.id} className="border-b border-border pb-6">
              <Link href={`/blog/${post.slug}`}>
                <h2 className="mb-2 text-lg font-semibold text-foreground hover:text-primary">
                  {post.title}
                </h2>
              </Link>
              <p className="text-sm text-muted-foreground">{post.excerpt}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
