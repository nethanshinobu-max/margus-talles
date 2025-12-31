const https = require('https');
const fs = require('fs');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent':  'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function scrapeUrlsCategorias() {
  console.log('🔍 Scrapeando URLs de categorías desde margusoficial.com/productos/\n');
  
  try {
    const html = await httpsGet('https://margusoficial.com/productos/');
    
    // Buscar todos los enlaces de categorías
    const regex = /<a[^>]+href=["'](https: \/\/margusoficial\.com\/[^"']+?)["'][^>]*>/gi;
    const urlsEncontradas = new Set();
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      const url = match[1];
      
      // Filtrar solo categorías (excluir home, carrito, etc)
      if (! url.includes('/productos') && 
          !url.includes('/carrito') && 
          !url.includes('/mi-cuenta') &&
          !url.includes('/finalizar-compra') &&
          url !== 'https://margusoficial.com/' &&
          !url.includes('? ') &&
          !url.includes('#')) {
        urlsEncontradas.add(url);
      }
    }
    
    const urls = Array.from(urlsEncontradas).sort();
    
    console.log(`✅ Encontradas ${urls.length} URLs de categorías:\n`);
    urls.forEach((url, i) => {
      const nombre = url.split('/').filter(x => x && x !== 'https: ' && x !== 'margusoficial.com').pop();
      console.log(`[${i + 1}] ${nombre}`);
    });
    
    // Guardar
    fs.writeFileSync('categorias-urls-nuevas.txt', urls.join('\n'));
    console.log('\n✅ Guardado en categorias-urls-nuevas.txt');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

scrapeUrlsCategorias();
