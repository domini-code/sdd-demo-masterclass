import { test, expect } from '@playwright/test'

test.describe('Búsqueda de artículos en tiempo real', () => {
  test('golden path: filtrar, no-resultados, limpiar', async ({ page }) => {
    await page.goto('/')

    const search = page.getByLabel('Buscar artículos')
    await expect(search).toBeVisible()
    await expect(search).toHaveAttribute('placeholder', /Buscar artículos/)

    // Estado inicial: artículos visibles.
    await expect(
      page.getByRole('heading', { name: /Supabase Auth con Next.js/ })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /TypeScript strict/ })
    ).toBeVisible()

    // Filtrar por "Supabase" — solo el post 3 lo menciona en título.
    await search.fill('Supabase')
    await expect(
      page.getByRole('heading', { name: /Supabase Auth con Next.js/ })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /TypeScript strict/ })
    ).toHaveCount(0)

    // Sin resultados.
    await search.fill('zzzzzzzz')
    await expect(page.getByText('No se encontraron artículos')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /Supabase Auth con Next.js/ })
    ).toHaveCount(0)

    // Limpiar input → todos los artículos vuelven a aparecer.
    await search.fill('')
    await expect(
      page.getByRole('heading', { name: /Supabase Auth con Next.js/ })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /TypeScript strict/ })
    ).toBeVisible()
    await expect(page.getByText('No se encontraron artículos')).toHaveCount(0)
  })

  test('búsqueda ignora acentos', async ({ page }) => {
    await page.goto('/')
    const search = page.getByLabel('Buscar artículos')

    // El título "Cómo usar SDD…" tiene tilde. Buscar "como" sin tilde
    // debe encontrarlo.
    await search.fill('como')
    await expect(
      page.getByRole('heading', { name: /Cómo usar SDD/ })
    ).toBeVisible()
  })
})
