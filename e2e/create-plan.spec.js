import { test, expect } from '@playwright/test'

test('create plan flow', async ({ page }) => {
  await page.goto('/')

  const loginPage = page.getByTestId('login-page')
  if (await loginPage.count()) {
    await page.getByTestId('login-username').fill('e2e')
    await page.getByTestId('login-password').fill('e2e')
    await page.getByTestId('login-submit').click()
  }

  await page.getByTestId('nav-create-plan').click()

  await page.getByTestId('plan-name').fill(`e2e plan ${Date.now()}`)
  await page.getByTestId('plan-width').fill('1000')
  await page.getByTestId('plan-height').fill('500')
  await page.getByTestId('plan-quantity').fill('1')
  await page.getByTestId('plan-thickness').fill('1')

  const presetDropdown = page.getByTestId('plan-preset')
  await presetDropdown.getByRole('button').click()
  await presetDropdown
    .locator('.dropdown-menu.show .dropdown-item:not(.disabled)')
    .first()
    .click()

  const materialDropdown = page.getByTestId('plan-material')
  await materialDropdown.getByRole('button').click()
  await materialDropdown
    .locator('.dropdown-menu.show .dropdown-item:not(.disabled)')
    .first()
    .click()

  await page.getByTestId('plan-submit').click()

  await expect(page.getByTestId('plan-editor')).toBeVisible()
})

