const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Función para descargar una imagen desde una URL
async function downloadImage(url, filepath) {
  const response = await axios({
    url,
    responseType: 'stream',
  });
  return new Promise((resolve, reject) => {
    response.data.pipe(fs.createWriteStream(filepath))
      .on('finish', resolve)
      .on('error', reject);
  });
}

// Función para procesar un producto
async function processProduct(page, productUrl) {
  await page.goto(productUrl, { waitUntil: 'networkidle2' });

  // Extrae el SKU
  const sku = await page.evaluate(() => {
    const skuElement = document.querySelector('.product.attribute.sku .value');
    return skuElement ? skuElement.textContent.trim() : null;
  });

  if (!sku) {
    console.error(`SKU no encontrado para la URL: ${productUrl}`);
    return;
  }

  // Extrae la información de las imágenes
  const images = await page.evaluate(() => {
    const imageElements = document.querySelectorAll('.fotorama__stage__frame');
    const images = [];
    imageElements.forEach((el) => {
      const href = el.getAttribute('href');
      if (href) {
        images.push(href);
      }
    });
    return images;
  });

  // Crea un directorio para guardar las imágenes
  const dir = './images4';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  // Descarga las imágenes y las guarda con el SKU como nombre de archivo
  let index = 1;
  for (const imageUrl of images) {
    const filepath = path.join(dir, `${sku}_${index}.jpg`);
    try {
      await downloadImage(imageUrl, filepath);
      console.log(`Descargada y guardada imagen: ${filepath}`);
      index++;
    } catch (error) {
      console.error(`Error descargando la imagen: ${imageUrl}`, error);
    }
  }
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Lee la lista de productos desde el archivo
  const fileStream = fs.createReadStream('./output_links2.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const productName = line.trim();
    if (productName) {
      const productUrl = productName;
      await processProduct(page, productUrl);
    }
  }

  await browser.close();
})();