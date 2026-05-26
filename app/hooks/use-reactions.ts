"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import type { ReactionState } from "@/lib/types"

export function useReactions(postId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { user } = useUser()

  const queryKey = ["reactions", postId]

  const { data } = useQuery<ReactionState>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/reactions?post_id=${postId}`)
      if (!res.ok) throw new Error("Error al cargar reacciones")
      return res.json()
    },
  })

  const count = data?.count ?? 0
  const userHasReacted = data?.userHasReacted ?? false

  const mutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      if (userHasReacted) {
        const res = await fetch(`/api/reactions?post_id=${postId}`, { method: "DELETE" })
        if (!res.ok) throw new Error("Error al quitar reacción")
      } else {
        const res = await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_id: postId }),
        })
        if (!res.ok && res.status !== 409) throw new Error("Error al guardar reacción")
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<ReactionState>(queryKey)

      queryClient.setQueryData<ReactionState>(queryKey, (old) => {
        const current = old ?? { count: 0, userHasReacted: false }
        return current.userHasReacted
          ? { count: Math.max(0, current.count - 1), userHasReacted: false }
          : { count: current.count + 1, userHasReacted: true }
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      const ctx = context as { previous?: ReactionState } | undefined
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(queryKey, ctx.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const toggleReaction = () => {
    if (!user) {
      router.push("/login")
      return
    }
    mutation.mutate()
  }

  return {
    count,
    userHasReacted,
    toggleReaction,
    isPending: mutation.isPending,
  }
}
