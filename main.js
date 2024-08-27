const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json()); // To parse JSON bodies

let browser; // Keep a reference to the browser instance

async function loginLive(email, password) {
    const page = await browser.newPage();
    console.log('New page created');

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto('https://login.live.com', { waitUntil: 'networkidle2' });
    console.log('Navigated to login.live.com');
    
    // Enter email
    await page.type('input[name="loginfmt"]', email);
    console.log('Email entered');

    // Click "Next" button
    await page.waitForSelector('button#idSIButton9', { visible: true, timeout: 10000 });
    await page.click('button#idSIButton9');
    console.log('Clicked Next');

    // Wait for the password field and enter password
    await page.waitForSelector('input[name="passwd"]', { visible: true });
    await page.type('input[name="passwd"]', password);
    console.log('Password entered');

    // Click "Sign in" button
    await page.click('button#idSIButton9');
    console.log('Clicked Sign in');
    
    // Handle "Stay signed in?" prompt
    console.log('Waiting for "Stay signed in" button');
    await page.waitForSelector('button#declineButton', { visible: true, timeout: 10000 });
    await page.click('button#declineButton');
    console.log('Clicked Stay signed in');

    // Wait for the page to fully load after login
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('Logged in successfully');
    
    await page.close(); // Close the page after login
}

async function startBrowser() {
    browser = await puppeteer.launch({
        headless: true, // Set to true if you want to run in headless mode
        executablePath: '/opt/render/project/.render/chrome/opt/google/chrome/google-chrome',
        args: ['--no-sandbox']
    });
    console.log('Browser launched');
}

// Route to handle login requests
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    try {
        await loginLive(email, password);
        res.status(200).send('Logged in successfully');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Login failed');
    }

    // Restart the browser after login
    await browser.close();
    console.log('Browser closed');

    await startBrowser(); // Re-launch the browser and wait for the next request
});

// Start the browser initially
startBrowser().then(() => {
    // Start the Express server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
