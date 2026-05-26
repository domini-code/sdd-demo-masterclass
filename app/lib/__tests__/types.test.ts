import type { ReactionState } from "@/lib/types"
import { it, expect } from "vitest"

it("ReactionState tiene count y userHasReacted", () => {
  const s: ReactionState = { count: 0, userHasReacted: false }
  expect(s.count).toBe(0)
  expect(s.userHasReacted).toBe(false)
})
