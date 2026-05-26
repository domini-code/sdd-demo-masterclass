import React from "react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactionButton } from "@/components/ReactionButton"

vi.mock("next/navigation", () => ({
  useRouter: vi.fn().mockReturnValue({ push: vi.fn() }),
}))

vi.mock("@/hooks/use-user", () => ({
  useUser: vi.fn().mockReturnValue({ user: { id: "user-1", email: "test@test.com" }, isLoading: false }),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  return Wrapper
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  cleanup()
})

describe("Flujo de reacciones — usuario autenticado", () => {
  it("muestra el contador inicial y lo incrementa optimistamente al hacer clic", async () => {
    let resolveMutation!: (val: Response) => void
    const pendingMutation = new Promise<Response>((resolve) => { resolveMutation = resolve })

    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ count: 3, userHasReacted: false }), { status: 200 })
      )
      .mockImplementationOnce(() => pendingMutation)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ count: 4, userHasReacted: true }), { status: 200 })
      )

    render(<ReactionButton postId="post-1" />, { wrapper: createWrapper() })

    await waitFor(() => expect(screen.getByText("3")).toBeDefined())

    fireEvent.click(screen.getByRole("button"))

    await waitFor(() => expect(screen.getByText("4")).toBeDefined())
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("true")

    resolveMutation(new Response(null, { status: 201 }))
  })
})
