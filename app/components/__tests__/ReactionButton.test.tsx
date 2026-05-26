import React from "react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { ReactionButton } from "../ReactionButton"

vi.mock("@/hooks/use-reactions", () => ({
  useReactions: vi.fn(),
}))

import { useReactions } from "@/hooks/use-reactions"

const mockToggle = vi.fn()

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useReactions).mockReturnValue({
    count: 5,
    userHasReacted: false,
    toggleReaction: mockToggle,
    isPending: false,
  })
})

describe("ReactionButton", () => {
  it("renderiza el contador correctamente", () => {
    render(<ReactionButton postId="42" />)
    expect(screen.getByText("5")).toBeDefined()
  })

  it('tiene aria-pressed="false" cuando no ha reaccionado', () => {
    render(<ReactionButton postId="42" />)
    const button = screen.getByRole("button")
    expect(button.getAttribute("aria-pressed")).toBe("false")
  })

  it('tiene aria-pressed="true" cuando ya reaccionó', () => {
    vi.mocked(useReactions).mockReturnValue({
      count: 6,
      userHasReacted: true,
      toggleReaction: mockToggle,
      isPending: false,
    })
    render(<ReactionButton postId="42" />)
    const button = screen.getByRole("button")
    expect(button.getAttribute("aria-pressed")).toBe("true")
  })

  it("tiene aria-label que incluye 'Me gusta'", () => {
    render(<ReactionButton postId="42" />)
    const button = screen.getByRole("button")
    expect(button.getAttribute("aria-label")).toContain("Me gusta")
  })

  it("el botón está deshabilitado cuando isPending es true", () => {
    vi.mocked(useReactions).mockReturnValue({
      count: 5,
      userHasReacted: false,
      toggleReaction: mockToggle,
      isPending: true,
    })
    render(<ReactionButton postId="42" />)
    const button = screen.getByRole("button")
    expect((button as HTMLButtonElement).disabled).toBe(true)
  })

  it("hacer clic llama toggleReaction", () => {
    render(<ReactionButton postId="42" />)
    fireEvent.click(screen.getByRole("button"))
    expect(mockToggle).toHaveBeenCalledTimes(1)
  })
})
