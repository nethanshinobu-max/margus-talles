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

async function scrapeCategoria(url) {
  try {
    const html = await httpsGet(url);
    
    const talles = [];
    const regex = /data-filter-name="Talles"\s+data-filter-value="(\d+)"/g;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      const talleNum = parseInt(match[1]);
      if (!isNaN(talleNum) && talleNum >= 34 && talleNum <= 64) {
        talles.push(talleNum);
      }
    }
    
    return [... new Set(talles)].sort((a, b) => a - b);
  } catch (error) {
    console.error(`❌ Error: `, error.message);
    return [];
  }
}

async function main() {
  console.log('🚀 Iniciando scraper de categorías...\n');
  
  const urls = fs.readFileSync('categorias-urls.txt', 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line. length > 0);
  
  console.log(`📋 Total:  ${urls.length} categorías\n`);
  
  const resultado = {};
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const nombre = url.split('/').filter(x => x).pop();
    
    console.log(`[${i + 1}/${urls.length}] ${nombre}...`);
    
    const talles = await scrapeCategoria(url);
    resultado[nombre] = talles;
    
    if (talles.length > 0) {
      console.log(`   ✅ ${talles.join(', ')}`);
    } else {
      console.log(`   ⚠️ Sin talles`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  fs.writeFileSync('categorias-data.json', JSON.stringify(resultado, null, 2));
  console.log('\n✅ LISTO! ');
}

main().catch(error => {
  console.error('💥 Error:', error);
  process.exit(1);
});
