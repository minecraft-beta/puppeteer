const puppeteer = require('puppeteer');

(async () => { 
    const browser = await puppeteer.launch({
        headless: true, // Set to true if you want to run in headless mode
        executablePath: '/opt/render/project/.render/chrome/opt/google/chrome/google-chrome',
        args: ['--no-sandbox']
    });
    console.log('Browser launched');
    
    const page = await browser.newPage();
    console.log('New page created');
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto('https://login.live.com', { waitUntil: 'networkidle2' });
    console.log('Navigated to login.live.com');
    
    // Enter your email
    await page.type('input[name="loginfmt"]', 'doomantii@outlook.com');
    console.log('Email entered');

    // Wait for and click the "Next" button
    await page.waitForSelector('button#idSIButton9', { visible: true, timeout: 10000 });
    await page.click('button#idSIButton9');
    console.log('Clicked Next');

    // Wait for the password field to appear
    await page.waitForSelector('input[name="passwd"]', { visible: true });

    // Enter your password
    await page.type('input[name="passwd"]', 'Aloofking%45');
    console.log('Password entered');

    // Click the "Sign in" button
    await page.click('button#idSIButton9');
    console.log('Clicked Sign in');
    
    // Handle "Stay signed in?" prompt
    console.log('Waiting for "Stay signed in" button');
    await page.waitForSelector('button#declineButton', { visible: true, timeout: 10000 });
    await page.click('button#declineButton');
    console.log('Clicked Stay signed in');

    // Optional: Take a screenshot for debugging
    await page.screenshot({ path: './debug-screenshot.png' });
    console.log('Screenshot taken');

    // Wait for the page to fully load after login
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('Logged in successfully');
    
    // Close the browser
    await browser.close();
    console.log('Browser closed');
})();

