import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET, POST, DELETE } from "../route"

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}))

import { createServerClient } from "@/lib/supabase/server"

const mockUser = { id: "user-123", email: "test@test.com" }

describe("GET /api/reactions", () => {
  beforeEach(() => vi.clearAllMocks())

  it("devuelve { count, userHasReacted: false } para usuario anónimo", async () => {
    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [{ count: 3 }], error: null }),
        }),
      }),
    }
    vi.mocked(createServerClient).mockReturnValue(supabase as unknown as ReturnType<typeof createServerClient>)

    const req = new Request("http://localhost/api/reactions?post_id=42")
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(typeof body.count).toBe("number")
    expect(body.userHasReacted).toBe(false)
  })

  it("devuelve userHasReacted: true cuando el usuario ya reaccionó", async () => {
    let callIndex = 0
    const fromMock = vi.fn().mockImplementation(() => {
      callIndex++
      if (callIndex === 1) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [{ count: 1 }], error: null }),
          }),
        }
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [{ user_id: "user-123" }], error: null }),
          }),
        }),
      }
    })

    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: fromMock,
    }
    vi.mocked(createServerClient).mockReturnValue(supabase as unknown as ReturnType<typeof createServerClient>)

    const req = new Request("http://localhost/api/reactions?post_id=42")
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.userHasReacted).toBe(true)
  })
})

describe("POST /api/reactions", () => {
  beforeEach(() => vi.clearAllMocks())

  it("devuelve 401 si no hay sesión", async () => {
    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn(),
    }
    vi.mocked(createServerClient).mockReturnValue(supabase as unknown as ReturnType<typeof createServerClient>)

    const req = new Request("http://localhost/api/reactions", {
      method: "POST",
      body: JSON.stringify({ post_id: "42" }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it("devuelve 201 al crear reacción", async () => {
    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      }),
    }
    vi.mocked(createServerClient).mockReturnValue(supabase as unknown as ReturnType<typeof createServerClient>)

    const req = new Request("http://localhost/api/reactions", {
      method: "POST",
      body: JSON.stringify({ post_id: "42" }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })

  it("devuelve 409 si la reacción ya existe", async () => {
    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: { code: "23505", message: "duplicate" } }),
      }),
    }
    vi.mocked(createServerClient).mockReturnValue(supabase as unknown as ReturnType<typeof createServerClient>)

    const req = new Request("http://localhost/api/reactions", {
      method: "POST",
      body: JSON.stringify({ post_id: "42" }),
    })
    const res = await POST(req)
    expect(res.status).toBe(409)
  })
})

describe("DELETE /api/reactions", () => {
  beforeEach(() => vi.clearAllMocks())

  it("devuelve 401 si no hay sesión", async () => {
    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn(),
    }
    vi.mocked(createServerClient).mockReturnValue(supabase as unknown as ReturnType<typeof createServerClient>)

    const req = new Request("http://localhost/api/reactions?post_id=42", { method: "DELETE" })
    const res = await DELETE(req)
    expect(res.status).toBe(401)
  })

  it("devuelve 200 al eliminar reacción", async () => {
    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
      from: vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      }),
    }
    vi.mocked(createServerClient).mockReturnValue(supabase as unknown as ReturnType<typeof createServerClient>)

    const req = new Request("http://localhost/api/reactions?post_id=42", { method: "DELETE" })
    const res = await DELETE(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })
})
