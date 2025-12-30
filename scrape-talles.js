const https = require('https');
const fs = require('fs');

const marcas = [
  'cenitho', 'isostasia1', 'torine', 'inquieta', 'gorsi', 'striven',
  'deka', 'crisal', 'flex', 'sttevia', 'sonne', 'versus',
  'ana-clara', 'andar', 'volsano', 'cruzo', 'h-reina', 'rumaju',
  'principessa', 'kawaii', 'yekus', 'thalasso', 'exito',
  'topazzio', 'ohmydenim', 'gooco'
];

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function scrapeMarca(marca) {
  try {
    const url = `https://margusoficial.com/marcas/${marca}/`;
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
    
    return [...new Set(talles)].sort((a, b) => a - b);
  } catch (error) {
    console.error(`❌ Error ${marca}:`, error.message);
    return [];
  }
}

async function updateAllMarcas() {
  const tallesData = {};
  
  console.log('🚀 Scraping 26 marcas...\n');
  
  for (const marca of marcas) {
    console.log(`📊 ${marca}...`);
    const talles = await scrapeMarca(marca);
    if (talles.length > 0) {
      tallesData[marca] = talles;
      console.log(`   ✅ ${talles.join(', ')}`);
    } else {
      console.log(`   ⚠️ Sin talles`);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  fs.writeFileSync('talles-data.json', JSON.stringify(tallesData, null, 2));
  console.log('\n🎉 LISTO!');
}

updateAllMarcas().catch(error => {
  console.error('💥 Error:', error);
  process.exit(1);
});
