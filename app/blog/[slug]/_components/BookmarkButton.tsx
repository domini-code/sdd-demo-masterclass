"use client"

import { Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/use-user"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useToast } from "@/hooks/use-toast"

interface BookmarkButtonProps {
  postId: string
}

export function BookmarkButton({ postId }: BookmarkButtonProps) {
  const { user } = useUser()
  const { isBookmarked, toggleBookmark, isPending } = useBookmarks()
  const { toast } = useToast()

  const saved = isBookmarked(postId)

  function handleClick() {
    if (!user) {
      toast("Inicia sesión para guardar artículos", "info")
      return
    }
    toggleBookmark(postId)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isPending}
      aria-label={saved ? "Eliminar de guardados" : "Guardar artículo"}
    >
      {saved ? <BookmarkCheck /> : <Bookmark />}
    </Button>
  )
}
