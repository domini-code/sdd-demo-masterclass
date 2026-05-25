import React from "react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { BookmarkButton } from "../BookmarkButton"

vi.mock("@/hooks/use-bookmarks", () => ({
  useBookmarks: vi.fn(),
}))
vi.mock("@/hooks/use-user", () => ({
  useUser: vi.fn(),
}))
vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}))
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn().mockReturnValue({ data: undefined, isLoading: false }),
  useMutation: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
  useQueryClient: vi.fn().mockReturnValue({}),
}))

import { useBookmarks } from "@/hooks/use-bookmarks"
import { useUser } from "@/hooks/use-user"
import { useToast } from "@/hooks/use-toast"

const mockUser = { id: "user-1", email: "test@test.com" }
const mockToast = vi.fn()
const mockToggle = vi.fn()
const mockIsBookmarked = vi.fn()

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useToast).mockReturnValue({ toast: mockToast, toasts: [], dismiss: vi.fn() })
  vi.mocked(useBookmarks).mockReturnValue({
    bookmarks: [],
    isBookmarked: mockIsBookmarked.mockReturnValue(false),
    toggleBookmark: mockToggle,
    isPending: false,
  })
  vi.mocked(useUser).mockReturnValue({ user: mockUser, isLoading: false })
})

describe("BookmarkButton", () => {
  it('renderiza ícono "no guardado" cuando el post no está en bookmarks', () => {
    mockIsBookmarked.mockReturnValue(false)
    render(<BookmarkButton postId="42" />)
    expect(screen.getByRole("button", { name: "Guardar artículo" })).toBeDefined()
  })

  it('renderiza ícono "guardado" cuando el post está en bookmarks', () => {
    mockIsBookmarked.mockReturnValue(true)
    render(<BookmarkButton postId="42" />)
    expect(screen.getByRole("button", { name: "Eliminar de guardados" })).toBeDefined()
  })

  it("el botón está deshabilitado mientras isPending es true", () => {
    vi.mocked(useBookmarks).mockReturnValue({
      bookmarks: [],
      isBookmarked: vi.fn().mockReturnValue(false),
      toggleBookmark: mockToggle,
      isPending: true,
    })
    render(<BookmarkButton postId="42" />)
    const button = screen.getByRole("button")
    expect((button as HTMLButtonElement).disabled).toBe(true)
  })

  it("hacer clic llama toggleBookmark con el postId correcto", () => {
    render(<BookmarkButton postId="42" />)
    fireEvent.click(screen.getByRole("button"))
    expect(mockToggle).toHaveBeenCalledWith("42")
  })

  it("usuario no autenticado — clic muestra toast sin llamar toggleBookmark", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, isLoading: false })
    render(<BookmarkButton postId="42" />)
    fireEvent.click(screen.getByRole("button"))
    expect(mockToggle).not.toHaveBeenCalled()
    expect(mockToast).toHaveBeenCalledWith("Inicia sesión para guardar artículos", "info")
  })
})
