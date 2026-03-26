const puppeteer = require('puppeteer');

(async () => {
    console.log("Iniciando Puppeteer...");
    let browser;
    try {
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    } catch (e) {
        console.log("Puppeteer não encontrado. Tentando importar playwright...");
        const { chromium } = require('playwright');
        browser = await chromium.launch({ headless: true });
    }

    const page = await browser.newPage();
    
    // Captura os logs do console da página
    const logs = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            logs.push(`[ERROR] ${msg.text()}`);
        } else {
            logs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
        }
    });
    
    page.on('pageerror', error => {
        logs.push(`[PAGE ERROR] ${error.message}`);
    });

    console.log("Acessando localhost:5173...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 10000 }).catch(e => logs.push(`[NAV ERROR] ${e.message}`));
    
    // Espera um pouco para garantir que a renderização inicial terminou
    await page.waitForTimeout(3000).catch(() => new Promise(r => setTimeout(r, 3000)));

    console.log("Erros capturados:");
    console.log(logs.join('\n'));
    
    await browser.close();
})();
