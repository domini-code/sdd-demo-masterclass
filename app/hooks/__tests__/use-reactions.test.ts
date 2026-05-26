import React from "react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useReactions } from "../use-reactions"

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
})

describe("useReactions — lectura", () => {
  it("expone count, userHasReacted, toggleReaction e isPending", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ count: 5, userHasReacted: false }), { status: 200 })
    )

    const { result } = renderHook(() => useReactions("post-1"), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.count).toBe(5))

    expect(result.current.userHasReacted).toBe(false)
    expect(typeof result.current.toggleReaction).toBe("function")
    expect(typeof result.current.isPending).toBe("boolean")
  })
})

describe("useReactions — toggleReaction optimista", () => {
  it("incrementa count optimistamente cuando userHasReacted es false", async () => {
    let resolveMutation!: (val: Response) => void
    const pendingMutation = new Promise<Response>((resolve) => { resolveMutation = resolve })

    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ count: 3, userHasReacted: false }), { status: 200 })
      )
      .mockImplementationOnce(() => pendingMutation)

    const { result } = renderHook(() => useReactions("post-1"), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.count).toBe(3))

    act(() => { result.current.toggleReaction() })

    await waitFor(() => expect(result.current.count).toBe(4))
    await waitFor(() => expect(result.current.userHasReacted).toBe(true))

    resolveMutation(new Response(null, { status: 201 }))
  })

  it("decrementa count optimistamente cuando userHasReacted es true", async () => {
    let resolveMutation!: (val: Response) => void
    const pendingMutation = new Promise<Response>((resolve) => { resolveMutation = resolve })

    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ count: 5, userHasReacted: true }), { status: 200 })
      )
      .mockImplementationOnce(() => pendingMutation)

    const { result } = renderHook(() => useReactions("post-1"), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.count).toBe(5))

    act(() => { result.current.toggleReaction() })

    await waitFor(() => expect(result.current.count).toBe(4))
    await waitFor(() => expect(result.current.userHasReacted).toBe(false))

    resolveMutation(new Response(JSON.stringify({ success: true }), { status: 200 }))
  })

  it("revierte al estado anterior si la petición falla", async () => {
    let rejectMutation!: (err: Error) => void
    const deferredRejection = new Promise<Response>((_, reject) => {
      rejectMutation = reject
    })

    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ count: 3, userHasReacted: false }), { status: 200 })
      )
      .mockImplementationOnce(() => deferredRejection)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ count: 3, userHasReacted: false }), { status: 200 })
      )

    const { result } = renderHook(() => useReactions("post-1"), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.count).toBe(3))

    act(() => { result.current.toggleReaction() })
    await waitFor(() => expect(result.current.count).toBe(4))

    rejectMutation(new Error("Network error"))

    await waitFor(() => expect(result.current.count).toBe(3))
    await waitFor(() => expect(result.current.userHasReacted).toBe(false))
  })
})
