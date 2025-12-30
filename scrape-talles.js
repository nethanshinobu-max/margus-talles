const axios = require('axios');
const cheerio = require('cheerio');
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
    const response = await axios.get(url, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    
    const talles = [];
    $('[data-filter-name="Talles"]').each((i, elem) => {
      const talle = $(elem).attr('data-filter-value');
      const talleNum = parseInt(talle);
      if (!isNaN(talleNum) && talleNum >= 34 && talleNum <= 64) {
        talles.push(talleNum);
      }
    });
    
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
