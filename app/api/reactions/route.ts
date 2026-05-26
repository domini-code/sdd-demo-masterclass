import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const post_id = searchParams.get("post_id")
  if (!post_id) return Response.json({ error: "post_id requerido" }, { status: 400 })

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: countData, error: countError } = await supabase
    .from("reactions")
    .select("count")
    .eq("post_id", post_id)

  if (countError) {
    console.error(countError)
    return Response.json({ count: 0, userHasReacted: false })
  }

  const count = (countData?.[0] as { count: number } | undefined)?.count ?? 0

  if (!user) {
    return Response.json({ count, userHasReacted: false })
  }

  const { data: userReaction } = await supabase
    .from("reactions")
    .select("user_id")
    .eq("post_id", post_id)
    .eq("user_id", user.id)

  const userHasReacted = Array.isArray(userReaction) && userReaction.length > 0

  return Response.json({ count, userHasReacted })
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const post_id = body?.post_id as string | undefined
  if (!post_id) return Response.json({ error: "post_id requerido" }, { status: 400 })

  const { error } = await supabase.from("reactions").insert({ user_id: user.id, post_id })

  if (error?.code === "23505") return Response.json({ error: "Ya reaccionaste" }, { status: 409 })
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

  const { error } = await supabase
    .from("reactions")
    .delete()
    .eq("user_id", user.id)
    .eq("post_id", post_id)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ success: true })
}
