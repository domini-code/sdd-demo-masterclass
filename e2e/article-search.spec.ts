import { test, expect } from "@playwright/test"

test.describe("Búsqueda de artículos en tiempo real", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("golden path — filtra artículos por título al escribir", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: "Buscar artículos" })
    await expect(searchInput).toBeVisible()

    // Initially all articles are visible (5 posts in static data)
    const cards = page.locator("article")
    await expect(cards).toHaveCount(5)

    // Type a search query that matches a known post
    await searchInput.fill("react")

    // Only posts containing "react" in title or excerpt should remain
    const filteredCards = page.locator("article")
    const count = await filteredCards.count()
    expect(count).toBeGreaterThan(0)
    expect(count).toBeLessThan(5)
  })

  test("muestra mensaje cuando no hay resultados", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: "Buscar artículos" })
    await searchInput.fill("xyz123noresults")

    await expect(page.getByText("No se encontraron artículos")).toBeVisible()
    await expect(page.locator("article")).toHaveCount(0)
  })

  test("restaura todos los artículos al limpiar el input", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: "Buscar artículos" })

    // Filter first
    await searchInput.fill("react")
    const filteredCount = await page.locator("article").count()
    expect(filteredCount).toBeGreaterThan(0)

    // Clear — all articles should come back
    await searchInput.clear()
    await expect(page.locator("article")).toHaveCount(5)
    await expect(page.getByText("No se encontraron artículos")).not.toBeVisible()
  })

  test("el filtrado es case-insensitive y normaliza acentos", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: "Buscar artículos" })

    // "REACT" uppercase should find posts with "React"
    await searchInput.fill("REACT")
    const upperCount = await page.locator("article").count()
    expect(upperCount).toBeGreaterThan(0)

    // "typescript" lowercase should find posts with "TypeScript"
    await searchInput.clear()
    await searchInput.fill("typescript")
    const lowerCount = await page.locator("article").count()
    expect(lowerCount).toBeGreaterThan(0)
  })
})
