// tests/example.spec.js
const { test, expect } = require('@playwright/test');

const TEST_PROFILE_NAME = 'Test User';
const TEST_MESSAGE = 'Hello from Playwright!';

test.beforeEach(async ({ page }) => {
  // Navigate to the app before each test
  await page.goto('/');
  // Nostr events can be slow, give some time for elements to appear if needed
  await page.waitForLoadState('networkidle');
});

test.describe('Nostr Chat App Tests', () => {
  test('1. Load application and verify initial UI', async ({ page }) => {
    await expect(page.locator('#sidebar')).toBeVisible();
    await expect(page.locator('#main')).toBeVisible();
    await expect(page.locator('#identity')).toBeVisible();
    await expect(page.locator('#user-name')).toHaveText('Anonymous');
    await expect(page.locator('#identity-action')).toHaveText('Load/Create');
  });

  test('2. Create Identity and Verify', async ({ page }) => {
    await page.getByRole('button', { name: 'Load/Create' }).click();
    // Wait for modal to appear
    await expect(page.locator('#identity-modal .modal-content h3')).toHaveText('Manage Identity');
    await page.locator('#privkey-input').fill(''); // Generate new key
    await page.getByRole('button', { name: 'Load/Gen' }).click();

    // Wait for potential async operations like profile fetch
    await page.waitForTimeout(1000); // Adjust if needed

    await expect(page.locator('#user-name')).not.toHaveText('Anonymous');
    await expect(page.locator('#user-pubkey')).toContainText('npub');
    await expect(page.locator('#identity-action')).toHaveText('Logout');
    await expect(page.getByRole('button', { name: 'Profile' })).toBeEnabled();
  });

  test.describe('Tests requiring identity', () => {
    // Log in once for this group of tests
    test.beforeEach(async ({ page }) => {
      // Check if already logged in from a previous test run in the same sequence (if applicable)
      const logoutButtonVisible = await page.locator('#identity-action:has-text("Logout")').isVisible();
      if (!logoutButtonVisible) {
        await page.getByRole('button', { name: 'Load/Create' }).click();
        await page.locator('#privkey-input').fill('');
        await page.getByRole('button', { name: 'Load/Gen' }).click();
        await page.waitForSelector('#identity-action:has-text("Logout")');
      }
       // Ensure public channel is selected for message sending
      await page.locator('.channel[data-channel-id="public"]').click();
      await expect(page.locator('#chat-header .channel-name')).toHaveText('Public Channel');
    });

    test('3. Send message to Public Feed', async ({ page }) => {
      await expect(page.locator('#message-input')).toBeVisible();
      await page.locator('#message-input').fill(TEST_MESSAGE);
      await page.getByRole('button', { name: 'Send' }).click();

      // Check if the message appears in the chat
      // This relies on real Nostr communication or a mocked environment
      await expect(page.locator('#chat-messages .message .message-text:has-text("' + TEST_MESSAGE + '")')).toBeVisible({ timeout: 10000 }); // Increased timeout for Nostr
    });

    test('4. Update Profile', async ({ page }) => {
      await page.getByRole('button', { name: 'Profile' }).click();
      await expect(page.locator('#profile-modal .modal-content h3')).toHaveText('Edit Profile');

      await page.locator('#profile-name-input').fill(TEST_PROFILE_NAME);
      await page.getByRole('button', { name: 'Save' }).click();

      // Wait for potential async operations
      await page.waitForTimeout(1000);
      await expect(page.locator('#user-name')).toHaveText(TEST_PROFILE_NAME);
    });

    test('5. Logout', async ({ page }) => {
      await page.getByRole('button', { name: 'Logout' }).click();
      // Handle confirmation dialog if one exists (current app does)
      page.on('dialog', dialog => dialog.accept());
      await page.getByRole('button', { name: 'Logout' }).click(); // Re-click if confirmation is needed

      await expect(page.locator('#user-name')).toHaveText('Anonymous');
      await expect(page.locator('#identity-action')).toHaveText('Load/Create');
      await expect(page.getByRole('button', { name: 'Profile' })).toBeDisabled();
    });
  });
});
