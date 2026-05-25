"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface BookmarksData {
  bookmarks: string[]
}

export function useBookmarks() {
  const queryClient = useQueryClient()

  const { data } = useQuery<BookmarksData>({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const res = await fetch("/api/bookmarks")
      if (!res.ok) throw new Error("Error al cargar bookmarks")
      return res.json()
    },
  })

  const bookmarks = data?.bookmarks ?? []

  const isBookmarked = (postId: string) => bookmarks.includes(postId)

  const mutation = useMutation<void, Error, string>({
    mutationFn: async (postId: string) => {
      const current = queryClient.getQueryData<BookmarksData>(["bookmarks"])
      const nowBookmarked = current?.bookmarks.includes(postId) ?? false

      if (nowBookmarked) {
        const res = await fetch(`/api/bookmarks?post_id=${postId}`, { method: "DELETE" })
        if (!res.ok) throw new Error("Error al eliminar bookmark")
      } else {
        const res = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_id: postId }),
        })
        if (!res.ok && res.status !== 409) throw new Error("Error al guardar bookmark")
      }
    },
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["bookmarks"] })
      const previous = queryClient.getQueryData<BookmarksData>(["bookmarks"])
      const isCurrentlyBookmarked = previous?.bookmarks.includes(postId) ?? false

      queryClient.setQueryData<BookmarksData>(["bookmarks"], (old) => ({
        bookmarks: isCurrentlyBookmarked
          ? (old?.bookmarks ?? []).filter((id) => id !== postId)
          : [...(old?.bookmarks ?? []), postId],
      }))

      return { previous }
    },
    onError: (_err, _postId, context) => {
      const ctx = context as { previous?: BookmarksData } | undefined
      if (ctx?.previous) {
        queryClient.setQueryData(["bookmarks"], ctx.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] })
    },
  })

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark: mutation.mutate,
    isPending: mutation.isPending,
  }
}
