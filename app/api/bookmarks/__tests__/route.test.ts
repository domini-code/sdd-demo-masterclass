import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET, POST, DELETE } from "../route"

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}))

import { createServerClient } from "@/lib/supabase/server"

const mockUser = { id: "user-123", email: "test@test.com" }

function makeSupabaseMock({
  user = null as typeof mockUser | null,
  selectData = null as { post_id: string }[] | null,
  selectError = null as { message: string } | null,
  insertError = null as { code?: string; message?: string } | null,
  deleteError = null as { message: string } | null,
  deleteCount = 1,
} = {}) {
  const selectEq = vi.fn().mockResolvedValue({ data: selectData, error: selectError })
  const selectBuilder = { eq: selectEq }

  const deleteEq2 = vi.fn().mockResolvedValue({ error: deleteError, count: deleteCount })
  const deleteEq1 = vi.fn().mockReturnValue({ eq: deleteEq2 })
  const deleteBuilder = { eq: deleteEq1 }

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue(selectBuilder),
      insert: vi.fn().mockResolvedValue({ error: insertError }),
      delete: vi.fn().mockReturnValue(deleteBuilder),
    }),
  }
}

describe("GET /api/bookmarks", () => {
  beforeEach(() => vi.clearAllMocks())

  it("devuelve 401 si no hay sesión", async () => {
    vi.mocked(createServerClient).mockReturnValue(makeSupabaseMock({ user: null }) as unknown as ReturnType<typeof createServerClient>)
    const res = await GET()
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it("devuelve { bookmarks: string[] } para usuario autenticado", async () => {
    vi.mocked(createServerClient).mockReturnValue(
      makeSupabaseMock({ user: mockUser, selectData: [{ post_id: "42" }] }) as unknown as ReturnType<typeof createServerClient>
    )
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ bookmarks: ["42"] })
  })
})

describe("POST /api/bookmarks", () => {
  beforeEach(() => vi.clearAllMocks())

  it("devuelve 401 si no hay sesión", async () => {
    vi.mocked(createServerClient).mockReturnValue(makeSupabaseMock({ user: null }) as unknown as ReturnType<typeof createServerClient>)
    const req = new Request("http://localhost/api/bookmarks", {
      method: "POST",
      body: JSON.stringify({ post_id: "42" }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it("devuelve 201 al guardar un bookmark válido", async () => {
    vi.mocked(createServerClient).mockReturnValue(
      makeSupabaseMock({ user: mockUser, insertError: null }) as unknown as ReturnType<typeof createServerClient>
    )
    const req = new Request("http://localhost/api/bookmarks", {
      method: "POST",
      body: JSON.stringify({ post_id: "42" }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })

  it("devuelve 409 si el bookmark ya existe", async () => {
    vi.mocked(createServerClient).mockReturnValue(
      makeSupabaseMock({ user: mockUser, insertError: { code: "23505", message: "duplicate" } }) as unknown as ReturnType<typeof createServerClient>
    )
    const req = new Request("http://localhost/api/bookmarks", {
      method: "POST",
      body: JSON.stringify({ post_id: "42" }),
    })
    const res = await POST(req)
    expect(res.status).toBe(409)
  })
})

describe("DELETE /api/bookmarks", () => {
  beforeEach(() => vi.clearAllMocks())

  it("devuelve 401 si no hay sesión", async () => {
    vi.mocked(createServerClient).mockReturnValue(makeSupabaseMock({ user: null }) as unknown as ReturnType<typeof createServerClient>)
    const req = new Request("http://localhost/api/bookmarks?post_id=42", { method: "DELETE" })
    const res = await DELETE(req)
    expect(res.status).toBe(401)
  })

  it("devuelve 200 al eliminar bookmark existente", async () => {
    vi.mocked(createServerClient).mockReturnValue(
      makeSupabaseMock({ user: mockUser, deleteError: null, deleteCount: 1 }) as unknown as ReturnType<typeof createServerClient>
    )
    const req = new Request("http://localhost/api/bookmarks?post_id=42", { method: "DELETE" })
    const res = await DELETE(req)
    expect(res.status).toBe(200)
  })

  it("devuelve 404 si el bookmark no existe", async () => {
    vi.mocked(createServerClient).mockReturnValue(
      makeSupabaseMock({ user: mockUser, deleteError: null, deleteCount: 0 }) as unknown as ReturnType<typeof createServerClient>
    )
    const req = new Request("http://localhost/api/bookmarks?post_id=42", { method: "DELETE" })
    const res = await DELETE(req)
    expect(res.status).toBe(404)
  })
})
