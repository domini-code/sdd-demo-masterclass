"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"

export function AuthNav() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase?.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (isLoading) return null

  if (!user) return null

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground hidden sm:block">
        {user.email}
      </span>
      <Button variant="outline" size="sm" onClick={handleLogout}>
        Salir
      </Button>
    </div>
  )
}
