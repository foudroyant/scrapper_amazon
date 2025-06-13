// scrape-amazon.js
const { PuppeteerCrawler, log } = require('apify');

const startUrl = 'https://www.amazon.fr/dp/B093TTVCC4';

(async () => {
  const crawler = new PuppeteerCrawler({
    // URLs à crawler
    requestHandler: async ({ page, request, enqueueLinks, log }) => {
      log.info(`Scraping: ${request.url}`);

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      );

      // Extraire le titre
      const title = await page.$eval('#productTitle', el => el.textContent.trim());

      console.log('📦 Titre du produit Amazon :', title);
    },

    // Gestion des erreurs
    failedRequestHandler: ({ request }) => {
      log.error(`❌ Échec du scraping: ${request.url}`);
    },

    // Paramètres supplémentaires
    launchContext: {
      launchOptions: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    },
  });

  // Ajouter l'URL à la file
  await crawler.run([{ url: startUrl }]);
})();
