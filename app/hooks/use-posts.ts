"use client"

import { useQuery } from "@tanstack/react-query"
import type { Post } from "@/lib/types"

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch("/api/posts")
  if (!res.ok) throw new Error("Error al cargar los artículos")
  return res.json()
}

export function usePosts() {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    staleTime: 1000 * 60 * 5,
  })

  return { posts: posts ?? [], isLoading, error }
}
