const express = require('express');
const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');

const app = express();
const PORT = 3000;

app.use(express.json());

// Fonction de scroll infini
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function scrapeAmazonProduct(url) {
  const browser = await puppeteer.launch({
    headless: false,
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
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000  });
    await page.waitForSelector('#altImages ul li');
    await page.click('#sp-cc-accept');
    await autoScroll(page);

    // Récupérer les infos principales
    const data = await page.evaluate(() => {
      const getText = (selector) =>
        document.querySelector(selector)?.textContent?.trim() || null;

      const title = getText("#productTitle");

      const price =
        getText("#corePriceDisplay_desktop_feature_div span.a-price") ||
        getText(".a-price") ||
        getText("#corePriceDisplay_mobile_feature_div");

      const description = getText("#feature-bullets") || '';
      const cleanText = description.replace(/\s+/g, ' ').trim();

      let images_avis = Array.from(document.querySelectorAll('img[alt="Image client, cliquez pour ouvrir le commentaire client"]')).map(img =>
        img.getAttribute('src').split("._")[0]+'.jpg'
      );

      if(images_avis.length == 0){
          images_avis = Array.from(document.querySelectorAll('img[alt="Customer Image, click to open customer review"]')).map(img =>
          img.getAttribute('src').split("._")[0]+'.jpg'
        );
      }


      const info = {};
      document
        .querySelectorAll("#productDetails_techSpec_section_1 tr")
        .forEach((row) => {
          const key = row.querySelector("th")?.innerText.trim();
          const val = row.querySelector("td")?.innerText.trim();
          if (key && val) info[key] = val;
        });

      return { title, price, description: cleanText, images : images_avis, info };
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

      const title = getText('h1[itemprop="name"]'); // Le titre est généralement dans un <h1>

      const price = getText('#DisplayPrice') + "€"; // La classe peut varier légèrement selon le type de page

      const description = getText('#ProductSheetAccordion-content-1'); // Parfois c'est ".descriptif", à ajuster si vide
      const info = getText('#ProductSheetAccordion-content-2')
      

      const imageElements = document.querySelector('#mainImage').src; //#mainImage
      const images = [imageElements]
      

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



function detectSite(url) {
  try {
    const hostname = new URL(url).hostname;

    if (/^(.+\.)?amazon\.[a-z]+$/.test(hostname)) {
      return "Amazon";
    } else if (/^(.+\.)?cdiscount\.com$/.test(hostname)) {
      return "Cdiscount";
    } else {
      return "Autre";
    }
  } catch {
    return "URL invalide";
  }
}


app.post('/scrape', async (req, res) => {
  const { url } = req.body;

  console.log(url)

  /*if (!url || !url.includes('amazon.') || !url.includes('amazon.')) {
    return res.status(400).json({ error: 'URL Amazon invalide' });
  }*/

  try {
    if(detectSite(url) == "Amazon"){
      const data = await scrapeAmazonProduct(url);
      console.log(data)
      return res.json(data);
    }
    else if(detectSite(url) == "Cdiscount"){
      const data = await scrapeCdiscountProduct(url);
      console.log(data)
      return res.json(data);
    }
    else {
      return res.json({
        "erreur" : "Saisissez un lien Amazon ou Cdiscount"
      })
    }
    
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
