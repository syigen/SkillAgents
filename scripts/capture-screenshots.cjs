const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    // Ensure screenshot directory exists
    const screenshotDir = path.join(__dirname, '..', 'public', 'docs', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    // 1. Login
    console.log('Logging in...');
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'dewmalnilanka@gmail.com');
    await page.fill('input[name="password"]', '1qaz2wsx');
    await page.click('button:has-text("Sign in")');

    // Wait for dashboard to load
    console.log('Waiting for dashboard...');
    await page.waitForURL('http://localhost:3000/');
    await page.waitForTimeout(2000); // Allow data to load

    console.log('Capturing Dashboard screenshot...');
    await page.screenshot({ path: path.join(screenshotDir, 'dashboard.png') });

    // 2. Templates Page -> Create Template
    console.log('Navigating to Templates...');
    await page.goto('http://localhost:3000/templates');
    await page.waitForTimeout(1000);
    console.log('Navigating to Create Template...');
    const createTemplateBtn = await page.$('a:has-text("Create Template")');
    if (createTemplateBtn) {
        await createTemplateBtn.click();
        await page.waitForTimeout(1500);
        console.log('Capturing Create Template screenshot...');
        await page.screenshot({ path: path.join(screenshotDir, 'create-template.png') });
    } else {
        console.log('Create template button not found, navigating directly...');
        await page.goto('http://localhost:3000/templates/new');
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(screenshotDir, 'create-template.png') });
    }

    // 3. Interviews Page -> Review Interview
    console.log('Navigating to Interviews...');
    await page.goto('http://localhost:3000/interviews');
    await page.waitForTimeout(1500);
    // Click on the first interview link (assuming there is a table/list)
    const firstInterviewLink = await page.$('tbody tr td a[href^="/interviews/"]'); // or however it's structured
    if (firstInterviewLink) {
        await firstInterviewLink.click();
        await page.waitForTimeout(2000);
        console.log('Capturing Review Interview screenshot...');
        await page.screenshot({ path: path.join(screenshotDir, 'review-interview.png'), fullPage: true });
    } else {
        console.log('No interviews found, capturing empty interviews page...');
        await page.screenshot({ path: path.join(screenshotDir, 'review-interview.png') });
    }

    // 4. Certificates Page
    console.log('Navigating to Certificates...');
    await page.goto('http://localhost:3000/certificates');
    await page.waitForTimeout(1500);
    // Click on the first certificate link
    const firstCertLink = await page.$('a[href^="/certificates/"]');
    if (firstCertLink) {
        await firstCertLink.click();
        await page.waitForTimeout(2000);
        console.log('Capturing Certificate screenshot...');
        await page.screenshot({ path: path.join(screenshotDir, 'certificate.png') });
    } else {
        console.log('No certificates found, capturing certificates list...');
        await page.screenshot({ path: path.join(screenshotDir, 'certificate.png') });
    }

    console.log('Done!');
    await browser.close();
})();
