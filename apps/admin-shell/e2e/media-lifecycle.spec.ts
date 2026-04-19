import { test, expect } from '@playwright/test';

/**
 * Media Lifecycle Scenario:
 * 1. Login
 * 2. Navigate to Media page
 * 3. Upload a file
 * 4. Verify file appears in list
 * 5. Delete file
 */

test.describe('Media Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    
    // Fill login form (assuming standard IDs from UiAuthWidget)
    await page.fill('input[placeholder*="email" i]', process.env.SUPERADMIN_EMAIL || 'admin@example.com');
    await page.fill('input[placeholder*="password" i]', process.env.SUPERADMIN_PASSWORD || 'admin');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to main page
    await expect(page).toHaveURL('/');
  });

  test('should upload and delete media', async ({ page }) => {
    // 2. Navigate to Media page via Sidebar or direct link
    // We'll use the sidebar if possible to test the switcher too
    
    // Wait for sidebar to load
    await page.waitForSelector('.the-sidebar');
    
    // Click on Media menu item
    await page.click('a[href="/media"]');
    await expect(page).toHaveURL('/media');

    // 3. Upload a file
    // Note: Assuming there is an upload button or dropzone
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('button:has-text("Загрузить"), button:has-text("Upload")');
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles([{
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: new TextEncoder().encode('fake-image-content'),
    }]);

    // Wait for upload to complete (UI should show progress or success)
    await page.waitForSelector('.media-item:has-text("test-image.png")');
    
    // 4. Verify it's in the list
    const mediaItem = page.locator('.media-item').filter({ hasText: 'test-image.png' });
    await expect(mediaItem).toBeVisible();

    // 5. Delete file
    await mediaItem.hover();
    await mediaItem.locator('button.delete-btn, [data-test="delete-btn"]').click();
    
    // Confirm deletion if there's a dialog
    const confirmBtn = page.locator('.el-message-box__btns button.el-button--primary');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    // Verify it's gone
    await expect(mediaItem).not.toBeVisible();
  });
});
