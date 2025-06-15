const express = require('express');
const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');

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
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000  });
    await page.waitForSelector('#altImages ul li');

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

      const info = {};
      document
        .querySelectorAll("#productDetails_techSpec_section_1 tr")
        .forEach((row) => {
          const key = row.querySelector("th")?.innerText.trim();
          const val = row.querySelector("td")?.innerText.trim();
          if (key && val) info[key] = val;
        });

      return { title, price, description: cleanText, info };
    });

    // Récupérer le HTML de la page
    const html = await page.content();
        // Parser avec jsdom
        const dom = new JSDOM(html);
        const document = dom.window.document;
        // Image principale
    const mainImage = document.querySelector('#imgTagWrapperId img')?.getAttribute('src');

    // Images supplémentaires (miniatures)
    const thumbImages = Array.from(document.querySelectorAll('.imageThumbnail img')).map(img =>
        img.getAttribute('src').replace("._AC_US100_","")
    );

    data["images"] = thumbImages

    
    //console.log('Miniatures:', thumbImages);

    // 🔁 Récupérer toutes les images via clics sur les miniatures
    /*const imageUrls = new Set();
    const thumbs = await page.$$('#altImages ul li');

    for (let i = 0; i < thumbs.length; i++) {
      const thumb = thumbs[i];
      console.log(i)

      // Scroll + click dans le navigateur (évite l'erreur "non cliquable")
      await page.evaluate(el => {
        el.scrollIntoView({ behavior: 'instant', block: 'center' });
        el.click();
      }, thumb);

      // Attendre que l’image principale change
      await page.waitForSelector('.imgTagWrapper img', { timeout: 5000 }).catch(() => {});

      const imgUrl = await page.evaluate(() => {
        const img = document.querySelector('.imgTagWrapper img');
        return img?.src?.replace('_SS40_', '_SL1000_') || null;
      });

      if (imgUrl) {
        console.log(imgUrl)
        imageUrls.add(imgUrl);
      }

      //await page.waitwaitForTimeout(500); // petite pause entre chaque clic
    }

    data.images = Array.from(imageUrls);*/

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
