import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import type { Post } from "@/lib/types"

vi.mock("@/lib/api", () => ({
  getPosts: vi.fn(),
}))
vi.mock("next/navigation", () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { url })
  }),
}))
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}))

import { getPosts } from "@/lib/api"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import BookmarksPage from "../page"

const mockUser = { id: "user-123", email: "test@test.com" }

const mockPosts: Post[] = [
  {
    id: "42",
    slug: "mi-articulo",
    title: "Mi artículo guardado",
    excerpt: "Descripción del artículo",
    coverImage: "https://example.com/img.jpg",
    publishedAt: "2025-01-01",
    readingTime: 5,
    tags: ["tag"],
  },
  {
    id: "99",
    slug: "otro-articulo",
    title: "Otro artículo",
    excerpt: "Otra descripción",
    coverImage: "https://example.com/img2.jpg",
    publishedAt: "2025-02-01",
    readingTime: 3,
    tags: ["tag2"],
  },
]

function makeSupabaseMock({
  user = null as typeof mockUser | null,
  bookmarkData = [] as { post_id: string }[],
} = {}) {
  const selectEq = vi.fn().mockResolvedValue({ data: bookmarkData, error: null })
  const selectBuilder = { eq: selectEq }
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue(selectBuilder) }),
  }
}

beforeEach(() => {
  vi.mocked(getPosts).mockResolvedValue(mockPosts)
})

afterEach(() => cleanup())

describe("BookmarksPage", () => {
  it("renderiza lista cuando hay bookmarks", async () => {
    vi.mocked(createServerClient).mockReturnValue(
      makeSupabaseMock({ user: mockUser, bookmarkData: [{ post_id: "42" }] }) as unknown as ReturnType<typeof createServerClient>
    )

    const page = await BookmarksPage()
    render(page)

    expect(screen.getByText("Mi artículo guardado")).toBeDefined()
    const link = screen.getByRole("link", { name: /Mi artículo guardado/ })
    expect((link as HTMLAnchorElement).href).toContain("/blog/mi-articulo")
    expect(screen.queryByText("Otro artículo")).toBeNull()
  })

  it("renderiza estado vacío cuando no hay bookmarks", async () => {
    vi.mocked(createServerClient).mockReturnValue(
      makeSupabaseMock({ user: mockUser, bookmarkData: [] }) as unknown as ReturnType<typeof createServerClient>
    )

    const page = await BookmarksPage()
    render(page)

    expect(screen.queryByText("Mi artículo guardado")).toBeNull()
    const blogLink = screen.getByRole("link", { name: /blog/i })
    expect((blogLink as HTMLAnchorElement).href).toContain("/blog")
  })

  it("redirige a / si el usuario no está autenticado", async () => {
    vi.mocked(createServerClient).mockReturnValue(
      makeSupabaseMock({ user: null }) as unknown as ReturnType<typeof createServerClient>
    )

    await expect(BookmarksPage()).rejects.toThrow("NEXT_REDIRECT")
    expect(redirect).toHaveBeenCalledWith("/")
  })
})
