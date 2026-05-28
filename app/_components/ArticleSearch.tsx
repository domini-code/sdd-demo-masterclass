"use client"

import { useState } from "react"
import type { Post } from "@/lib/types"
import { PostCard } from "@/components/PostCard"

function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
}

interface ArticleSearchProps {
  posts: Post[]
}

export function ArticleSearch({ posts }: ArticleSearchProps) {
  const [query, setQuery] = useState("")

  const filtered =
    query.trim() === ""
      ? posts
      : posts.filter((post) => {
          const q = normalize(query.trim())
          return normalize(post.title).includes(q) || normalize(post.excerpt).includes(q)
        })

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Últimos artículos</h2>
      </div>

      <div className="mb-6">
        <input
          type="search"
          aria-label="Buscar artículos"
          placeholder="Buscar artículos…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
