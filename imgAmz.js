const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');

(async () => {
  const url = 'https://www.amazon.fr/Na%C3%AFf-Nourrissant-Hydrate-nourrit-grossesse/dp/B0DJBT6D2M/ref=sr_1_3_sspa?dib=eyJ2IjoiMSJ9.8rEoHy2Vk4VJjbbi8jnonFRGBIq5j9MJNldYnrDHpeSq2WJ0a6CdGL54GiB5WFCk4KZ6CFcQlwFKj8dZNhjzpbycPCP9omOhl_Lu6TXDazEJrcj6Jx7AqeRs_PysT_77sCD_1b93Epfy4Sto28IolzjLtZ8-Ml1PoxABFpQgYbRgeBIBT_gXl8yzwCWvmPUz5MXbcD8Z6N1hLevcZoZw-xpn0S_rzd6p9_ndERgyd-tEdEDgwZxDco8QPNFl5SMh6jw0x0gjhAKOCGiowwXaQ8t9hfGR9MGyD9aTU-BH19Q.e8GJcUJgnKe7eMvUS3xKb_LYYpJtYJrroi4r7BncPjc&dib_tag=se&keywords=baume&qid=1750003516&sr=8-3-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1'; // Remplace avec l'URL du produit

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Amazon bloque souvent les requêtes automatisées, utilise un user-agent courant
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
  );

  await page.goto(url, { waitUntil: 'networkidle2' });

  // Attendre que les images soient chargées
  await page.waitForSelector('#imgTagWrapperId img');

  // Récupérer le HTML de la page
  const html = await page.content();

  // Parser avec jsdom
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Image principale
  const mainImage = document.querySelector('#imgTagWrapperId img')?.getAttribute('src');

  // Images supplémentaires (miniatures)
  const thumbImages = Array.from(document.querySelectorAll('.imageThumbnail img')).map(img =>
    img.getAttribute('src').replace(/\._[A-Z0-9,]+_\.jpg/, '._SL1500_.jpg') // version 1500px
  );

  console.log('Image principale:', mainImage);
  console.log('Miniatures:', thumbImages);

  await browser.close();
})();
