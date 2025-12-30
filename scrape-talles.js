const fetch = require('node-fetch');
const fs = require('fs');

const marcas = [
  'cenitho', 'isostasia1', 'torine', 'inquieta', 'gorsi', 'striven',
  'deka', 'crisal', 'flex', 'sttevia', 'sonne', 'versus',
  'ana-clara', 'andar', 'volsano', 'cruzo', 'h-reina', 'rumaju',
  'principessa', 'kawaii', 'yekus', 'thalasso', 'exito',
  'topazzio', 'ohmydenim', 'gooco'
];

async function scrapeMarca(marca) {
  try {
    const url = `https://margusoficial.com/marcas/${marca}/`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
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
    console.error(`❌ Error scraping ${marca}:`, error.message);
    return [];
  }
}

async function updateAllMarcas() {
  const tallesData = {};
  
  console.log('🚀 Iniciando scraping de 26 marcas...\n');
  
  for (const marca of marcas) {
    console.log(`📊 Scraping ${marca}...`);
    const talles = await scrapeMarca(marca);
    if (talles.length > 0) {
      tallesData[marca] = talles;
      console.log(`   ✅ ${marca}: ${talles.join(', ')}`);
    } else {
      console.log(`   ⚠️ ${marca}: No se encontraron talles`);
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  fs.writeFileSync('talles-data.json', JSON.stringify(tallesData, null, 2));
  console.log('\n🎉 ✅ talles-data.json actualizado correctamente!');
}

updateAllMarcas().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});
