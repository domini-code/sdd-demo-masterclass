"use client"

import { ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useReactions } from "@/hooks/use-reactions"

interface ReactionButtonProps {
  postId: string
}

export function ReactionButton({ postId }: ReactionButtonProps) {
  const { count, userHasReacted, toggleReaction, isPending } = useReactions(postId)

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleReaction}
      disabled={isPending}
      aria-pressed={userHasReacted}
      aria-label={userHasReacted ? "Quitar me gusta" : "Me gusta este post"}
      className={userHasReacted ? "text-primary" : "text-muted-foreground"}
    >
      <ThumbsUp className="mr-1 h-4 w-4" />
      <span>{count}</span>
    </Button>
  )
}
