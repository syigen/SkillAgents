const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Navigating to register page...');
    await page.goto('http://localhost:3000/register');

    // Generate a test email
    const id = Date.now();
    const email = `test.user.${id}@example.com`;
    const password = 'Password!123';

    console.log(`Signing up with ${email}...`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("Sign up")');

    await page.waitForTimeout(3000);
    const url = page.url();
    console.log(`Current URL after signup: ${url}`);

    const content = await page.textContent('body');
    if (content.includes('Check your email')) {
        console.log('Email confirmation is required.');
    } else {
        console.log('No email confirmation message found, might be logged in or requires manual check.');
    }

    // Try to login
    console.log('Logging in...');
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("Sign in")');

    await page.waitForTimeout(3000);
    const afterLoginUrl = page.url();
    console.log(`Current URL after login: ${afterLoginUrl}`);

    await browser.close();
})();
