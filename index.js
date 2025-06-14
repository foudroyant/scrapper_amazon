const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

app.use(express.json());

async function scrapeAmazonProduct(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
  );

  await page.setExtraHTTPHeaders({
    'accept-language': 'en-US,en;q=0.9',
  });

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    const data = await page.evaluate(() => {
      const getText = (selector) =>
        document.querySelector(selector)?.textContent?.trim() || null;

      const getAttr = (selector, attr) =>
        document.querySelector(selector)?.getAttribute(attr) || null;

      const title = getText("#productTitle");

      const price =
        getText(".a-size-base.a-color-price.a-color-price") ||
        getText("#priceblock_dealprice") ||
        getText("#price_inside_buybox");

      const description = getText(".a-expander-content.a-expander-partial-collapse-content") || '';
      const cleanText = description.replace(/\s+/g, ' ').trim();

      const images = Array.from(
        document.querySelectorAll("#landingImage")
      ).map((img) => img.src.replace("_SS40_", "_SL1000_"));

      const info = {};
      document
        .querySelectorAll("#productDetails_techSpec_section_1 tr")
        .forEach((row) => {
          const key = row.querySelector("th")?.innerText.trim();
          const val = row.querySelector("td")?.innerText.trim();
          if (key && val) info[key] = val;
        });

      return { title, price, description: cleanText, images, info };
    });

    await browser.close();
    return data;

  } catch (err) {
    console.error("Erreur :", err.message);
    await browser.close();
    throw err;
  }
}


async function scrapeCdiscountProduct(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
  );

  await page.setExtraHTTPHeaders({
    'accept-language': 'fr-FR,fr;q=0.9',
  });

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    const data = await page.evaluate(() => {
      const getText = (selector) =>
        document.querySelector(selector)?.textContent?.trim() || "";

      const getAttr = (selector, attr) =>
        document.querySelector(selector)?.getAttribute(attr) || ""; 

      const title = getText('h1'); // Le titre est généralement dans un <h1>

      const price = getText('.price'); // La classe peut varier légèrement selon le type de page

      const description = getText('.descriptif'); // Parfois c'est ".descriptif", à ajuster si vide

      const imageElements = document.querySelectorAll('.fpMainPicture img');
      const images = Array.from(imageElements).map((img) =>
        img.getAttribute('src')?.replace(/w\d+/, 'w1000')
      );

      const info = {};
      document.querySelectorAll('.ficha_tech .fichCol1').forEach((element) => {
        const key = element.textContent.trim();
        const value = element.nextElementSibling?.textContent.trim();
        if (key && value) info[key] = value;
      });

      return { title, price, description, images, info };
    });

    await browser.close();
    return data;

  } catch (err) {
    console.error("Erreur :", err.message);
    await browser.close();
    throw err;
  }
}






app.post('/scrape', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.includes('amazon.')) {
    return res.status(400).json({ error: 'URL Amazon invalide' });
  }

  try {
    const data = await scrapeAmazonProduct(url);
    return res.json(data);
  } catch (error) {
    console.error('Erreur:', error.message);
    return res.status(500).json({ error: 'Erreur lors du scraping' });
  }
});

app.get('/status', (req, res) => {
  res.json({ status: 'ok', message: 'Serveur en ligne 🚀' });
});

app.listen(PORT, () => {
  console.log(`Serveur Express lancé sur http://localhost:${PORT}`);
});
