import { getPosts } from "@/lib/api"

export async function GET() {
  const posts = await getPosts()
  return Response.json(posts)
}
