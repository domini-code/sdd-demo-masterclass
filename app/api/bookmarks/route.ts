import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await supabase
    .from("bookmarks")
    .select("post_id")
    .eq("user_id", user.id)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ bookmarks: (data ?? []).map((b: { post_id: string }) => b.post_id) })
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const post_id = body?.post_id as string | undefined
  if (!post_id) return Response.json({ error: "post_id requerido" }, { status: 400 })

  const { error } = await supabase.from("bookmarks").insert({ user_id: user.id, post_id })

  if (error?.code === "23505") return Response.json({ error: "Ya guardado" }, { status: 409 })
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return new Response(null, { status: 201 })
}

export async function DELETE(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const post_id = searchParams.get("post_id")
  if (!post_id) return Response.json({ error: "post_id requerido" }, { status: 400 })

  const { error, count } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", user.id)
    .eq("post_id", post_id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (count === 0) return Response.json({ error: "Bookmark no encontrado" }, { status: 404 })

  return Response.json({ success: true })
}
