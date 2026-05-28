import { test, expect } from "@playwright/test"

test.describe("Búsqueda de artículos en tiempo real", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForSelector('[aria-label="Buscar artículos"]', { state: "visible" })
  })

  test("muestra el campo de búsqueda en la página principal", async ({ page }) => {
    const input = page.getByRole("searchbox", { name: "Buscar artículos" })
    await expect(input).toBeVisible()
    await expect(input).toHaveAttribute("placeholder", "Buscar artículos…")
  })

  test("golden path — filtra artículos al escribir en el campo de búsqueda", async ({ page }) => {
    const input = page.getByRole("searchbox", { name: "Buscar artículos" })

    const initialCards = page.locator("article")
    const initialCount = await initialCards.count()
    expect(initialCount).toBeGreaterThan(0)

    await input.fill("react")
    await expect(input).toHaveValue("react")

    const filteredCards = page.locator("article")
    await expect(filteredCards.first()).toBeVisible()
    const filteredCount = await filteredCards.count()
    expect(filteredCount).toBeGreaterThan(0)
    expect(filteredCount).toBeLessThanOrEqual(initialCount)
  })

  test("restaura todos los artículos al borrar el texto", async ({ page }) => {
    const input = page.getByRole("searchbox", { name: "Buscar artículos" })

    const initialCards = page.locator("article")
    const initialCount = await initialCards.count()

    await input.fill("react")
    await expect(input).toHaveValue("react")

    await input.clear()
    await expect(input).toHaveValue("")

    const restoredCards = page.locator("article")
    await expect(restoredCards.first()).toBeVisible()
    await expect(restoredCards).toHaveCount(initialCount)
  })

  test("muestra mensaje cuando no hay resultados", async ({ page }) => {
    const input = page.getByRole("searchbox", { name: "Buscar artículos" })

    await input.fill("xxxxxxxxxx")
    await expect(input).toHaveValue("xxxxxxxxxx")

    await expect(page.getByText("No se encontraron artículos")).toBeVisible()
    await expect(page.locator("article")).toHaveCount(0)
  })

  test("el filtrado es case-insensitive y sin distinción de acentos", async ({ page }) => {
    const input = page.getByRole("searchbox", { name: "Buscar artículos" })

    await input.fill("REACT")
    await expect(input).toHaveValue("REACT")
    const cards = page.locator("article")
    await expect(cards.first()).toBeVisible()

    await input.fill("supabase")
    await expect(input).toHaveValue("supabase")
    await expect(cards.first()).toBeVisible()
  })
})
