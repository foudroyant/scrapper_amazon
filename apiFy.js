/*import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';*/

const {Actor} = require("apify")
const { PlaywrightCrawler } = require("crawlee")

async function test(){
  await Actor.init();

  const crawler = new PlaywrightCrawler({
      async requestHandler({ request, page, enqueueLinks }) {
          // Extract HTML title of the page.
          const title = await page.title();
          console.log(`Title of ${request.url}: ${title}`);

          // Add URLs that point to the same hostname.
          await enqueueLinks();
      },
  });

    await crawler.run(['https://www.amazon.fr/Tout-sur-business-ligne-Dropshipping/dp/B0CR812LVG/ref=sr_1_3_sspa?dib=eyJ2IjoiMSJ9.e3uuYLGcCEm3WM3r8t82kmcrG-cQvqybNNtDzxqaFu5y2A1BSN_kZwOPKkweSHfuxuRlZRvBm3RsrK6i9hCTMJZ1BHrl4Bajh343UQ9_AFdSUfgAEfWkhxNCvyqCkq6z6E6We6imobt5Iq6kPLSd8BjAspzGq_CmTl7wKraAelqrg7AImpe24OCGI6fUhJMtkHO5b0Trn7rzykP6C25Ue5KmoOW_0Fq6jWmaWg6sejcsfluzY4FBNf0w4peVTrjfiDZ9sYGl8w_CsfYPACi7GQvUfDQA-10MwQXjOtGqBHg.VTHYxI0VdWCCasaizRu3snaWeyYeC4xh3Mh9xwcOAOk&dib_tag=se&keywords=livre+sur+le+marketing&qid=1749819495&sr=8-3-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1']);
  //console.log(out)
  await Actor.exit();
}

test()