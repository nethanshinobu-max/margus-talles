const https = require('https');
const fs = require('fs');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      } 
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function scrapeUrlsCategorias() {
  console.log('🔍 Scrapeando URLs desde margusoficial. com/productos/\n');
  
  try {
    const html = await httpsGet('https://margusoficial.com/productos/');
    
    console.log('📄 HTML obtenido, largo:', html.length);
    
    // Buscar links que sean categorías
    const regex = /href=["'](https?:\/\/margusoficial\.com\/[^"']+?)["']/gi;
    const urlsEncontradas = new Set();
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      let url = match[1];
      
      // Normalizar URL
      url = url.replace(/\/$/, ''); // Quitar / final
      
      // Filtrar solo categorías válidas
      if (url.includes('/catalogo/') || 
          (url.split('/').length >= 4 && 
           ! url.includes('/productos') && 
           !url.includes('/carrito') && 
           !url.includes('/mi-cuenta') &&
           !url.includes('/finalizar-compra') &&
           !url.includes('? ') &&
           !url.includes('#'))) {
        
        // Agregar / al final
        if (!url.endsWith('/')) url += '/';
        urlsEncontradas.add(url);
      }
    }
    
    const urls = Array.from(urlsEncontradas).sort();
    
    console.log(`\n✅ Encontradas ${urls.length} URLs:\n`);
    urls.forEach((url, i) => {
      console.log(`${i + 1}. ${url}`);
    });
    
    if (urls.length === 0) {
      console.log('\n⚠️ No se encontraron URLs.  Guardando página HTML para debug...');
      fs.writeFileSync('debug-productos.html', html);
      console.log('✅ Guardado en debug-productos.html');
    } else {
      fs.writeFileSync('categorias-urls-nuevas.txt', urls.join('\n'));
      console.log('\n✅ Guardado en categorias-urls-nuevas. txt');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

scrapeUrlsCategorias();
