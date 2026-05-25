import React from "react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useBookmarks } from "../use-bookmarks"

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  )
  return Wrapper
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("useBookmarks — consultar bookmarks", () => {
  it("devuelve lista de post_id", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ bookmarks: ["42"] }), { status: 200 })
    )

    const { result } = renderHook(() => useBookmarks(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.bookmarks).toEqual(["42"]))
  })

  it("expone isBookmarked helper", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ bookmarks: ["42"] }), { status: 200 })
    )

    const { result } = renderHook(() => useBookmarks(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.bookmarks).toEqual(["42"]))

    expect(result.current.isBookmarked("42")).toBe(true)
    expect(result.current.isBookmarked("99")).toBe(false)
  })
})

describe("useBookmarks — toggleBookmark", () => {
  it("llama POST cuando el post NO está guardado", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ bookmarks: [] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ bookmarks: ["42"] }), { status: 200 }))

    const { result } = renderHook(() => useBookmarks(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.bookmarks).toEqual([]))

    act(() => { result.current.toggleBookmark("42") })

    await waitFor(() => {
      const calls = vi.mocked(fetch).mock.calls
      const postCall = calls.find((c) => (c[1] as RequestInit)?.method === "POST")
      expect(postCall).toBeDefined()
      const body = JSON.parse((postCall![1] as RequestInit).body as string)
      expect(body).toEqual({ post_id: "42" })
    })
  })

  it("llama DELETE cuando el post YA está guardado", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ bookmarks: ["42"] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ bookmarks: [] }), { status: 200 }))

    const { result } = renderHook(() => useBookmarks(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.bookmarks).toEqual(["42"]))

    act(() => { result.current.toggleBookmark("42") })

    await waitFor(() => {
      const calls = vi.mocked(fetch).mock.calls
      const deleteCall = calls.find((c) => (c[1] as RequestInit)?.method === "DELETE")
      expect(deleteCall).toBeDefined()
      expect(deleteCall![0] as string).toContain("post_id=42")
    })
  })

  it("aplica optimistic update antes de que el fetch resuelva", async () => {
    let resolveMutation!: (val: Response) => void
    const pendingMutation = new Promise<Response>((resolve) => { resolveMutation = resolve })

    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ bookmarks: ["42"] }), { status: 200 }))
      .mockImplementationOnce(() => pendingMutation)

    const { result } = renderHook(() => useBookmarks(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.bookmarks).toEqual(["42"]))

    act(() => { result.current.toggleBookmark("42") })

    // El update optimista ocurre antes de que el fetch resuelva
    await waitFor(() => expect(result.current.bookmarks).not.toContain("42"))

    resolveMutation(new Response(JSON.stringify({ success: true }), { status: 200 }))
  })

  it("revierte al estado anterior si el fetch falla", async () => {
    let rejectMutation!: (err: Error) => void
    const deferredRejection = new Promise<Response>((_, reject) => {
      rejectMutation = reject
    })

    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ bookmarks: ["42"] }), { status: 200 }))
      .mockImplementationOnce(() => deferredRejection)
      .mockResolvedValueOnce(new Response(JSON.stringify({ bookmarks: ["42"] }), { status: 200 }))

    const { result } = renderHook(() => useBookmarks(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.bookmarks).toEqual(["42"]))

    act(() => { result.current.toggleBookmark("42") })
    // El update optimista elimina '42'
    await waitFor(() => expect(result.current.bookmarks).not.toContain("42"))

    // Disparamos el error del network
    rejectMutation(new Error("Network error"))

    // Después del error, revierte al estado anterior
    await waitFor(() => expect(result.current.bookmarks).toContain("42"))
  })
})
