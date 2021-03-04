const puppeteer = require( 'puppeteer' );
const fs = require( 'fs' );

(async () => {
  const extractProducts = async (url) => {
    
    const page = await browser.newPage();
    await page.goto(url);
    console.log(`scraping: ${url}`)
    const productsOnPage = await page.evaluate(() => 
      Array.from(document.querySelectorAll('ul > li.product'))
      .map(product => ({

        id: product.querySelector('.information > .top > .product-number') && 
        product.querySelector('.information > .top > .product-number').textContent,

        title: product.querySelector('.information > .top > .title > span') &&
        product.querySelector('.information > .top > .title > span').textContent.trim(),

        images: [product.querySelector('img')] &&
        [product.querySelector('img').src],

        volume: product.querySelector('.information > .top-right > .sub > .volume') &&
        product.querySelector('.information > .top-right > .sub > .volume').textContent.trim(),

        abv: product.querySelector('.information > .top-right > .sub > .alcohol') &&
        product.querySelector('.information > .top-right > .sub > .alcohol').textContent.trim(),

        type: product.querySelector('.information > .sub > .category') &&
        product.querySelector('.information > .sub > .category').textContent.trim(),

        price: product.querySelector('.information > .top-right > .price') &&
        product.querySelector('.information > .top-right > .price').textContent.trim()

      }))
    )
    await page.close()

    if(productsOnPage.length < 1 ) {

      console.log( `terminate recursing on ${url}`)
      return productsOnPage
      
    } else {
      const nextPageNumber = parseInt(url.match(/page=(\d+)$/)[1], 10) + 1
      const nextUrl = `https://www.vinbudin.is/english/home/products/vorur?page=${nextPageNumber}`
      return productsOnPage.concat(await extractProducts(nextUrl))
    }
     
    
  }

  const browser = await puppeteer.launch();
  const firstUrl = `https://www.vinbudin.is/english/home/products/vorur?page=1`
  const products = await extractProducts(firstUrl)
  // console.log(products)

  fs.appendFile('../drinks.json', JSON.stringify(products), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
  await browser.close();
})();