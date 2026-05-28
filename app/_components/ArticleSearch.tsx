"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import type { Post } from "@/lib/types"
import { PostCard } from "@/components/PostCard"

interface ArticleSearchProps {
  posts: Post[]
}

function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
}

export function ArticleSearch({ posts }: ArticleSearchProps) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    if (query.trim() === "") return posts
    const q = normalize(query.trim())
    return posts.filter(
      (post) => normalize(post.title).includes(q) || normalize(post.excerpt).includes(q)
    )
  }, [posts, query])

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Últimos artículos</h2>
      </div>

      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          aria-label="Buscar artículos"
          placeholder="Buscar artículos…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {filtered.length === 0 && query.trim() !== "" ? (
        <p className="py-12 text-center text-muted-foreground">No se encontraron artículos</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  )
}
