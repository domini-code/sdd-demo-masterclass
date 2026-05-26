"use client"

import { useMemo, useState } from "react"
import type { Post } from "@/lib/types"
import { PostCard } from "@/components/PostCard"

interface SearchablePostListProps {
  posts: Post[]
}

const DIACRITICS_REGEX = /[̀-ͯ]/g

function normalize(str: string): string {
  return str.normalize("NFD").replace(DIACRITICS_REGEX, "").toLowerCase()
}

export function SearchablePostList({ posts }: SearchablePostListProps) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return posts
    return posts.filter(
      (post) =>
        normalize(post.title).includes(q) ||
        normalize(post.excerpt).includes(q)
    )
  }, [posts, query])

  return (
    <div>
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

      {filtered.length === 0 ? (
        <p
          role="status"
          className="py-12 text-center text-sm text-muted-foreground"
        >
          No se encontraron artículos
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
