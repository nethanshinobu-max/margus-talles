// Scraper para detectar talles disponibles por marca
// Ejecutar con: node scraper.js

const https = require('https');
const fs = require('fs');

const marcas = [
  'cenitho', 'isostasia1', 'torine', 'inquieta', 'gorsi', 'striven', 
  'deka', 'crisal', 'flex', 'sttevia', 'sonne', 'versus', 
  'ana-clara', 'andar', 'volsano', 'cruzo', 'h-reina', 'rumaju', 
  'principessa', 'kawaii', 'yekus', 'thalasso', 'exito', 
  'topazzio', 'ohmydenim', 'gooco'
];

const talles = [34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64];

const resultados = {};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkTalle(marca, talle) {
  return new Promise((resolve) => {
    const url = `https://margusoficial.com/marcas/${marca}/?Talles=${talle}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Si la página contiene productos o el filtro está activo, el talle existe
        const existe = data.includes('Filtrar por') && 
                      !data.includes('No hay productos') &&
                      !data.includes('sin resultados');
        
        resolve(existe);
      });
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function scrapeAll() {
  console.log('🔍 Iniciando scraper...\n');
  console.log(`📊 Total de peticiones: ${marcas.length * talles.length}\n`);
  
  let progreso = 0;
  const total = marcas.length * talles.length;
  
  for (const marca of marcas) {
    console.log(`\n🔍 Revisando marca: ${marca.toUpperCase()}`);
    resultados[marca] = [];
    
    for (const talle of talles) {
      const existe = await checkTalle(marca, talle);
      progreso++;
      
      if (existe) {
        resultados[marca].push(talle);
        console.log(`  ✅ Talle ${talle}: DISPONIBLE (${progreso}/${total})`);
      } else {
        console.log(`  ❌ Talle ${talle}: NO DISPONIBLE (${progreso}/${total})`);
      }
      
      // Esperar 500ms entre peticiones para no saturar el servidor
      await delay(500);
    }
    
    console.log(`\n📋 ${marca}: [${resultados[marca].join(', ')}]`);
  }
  
  // Guardar resultados en JSON
  fs.writeFileSync('talles-disponibles.json', JSON.stringify(resultados, null, 2));
  
  console.log('\n\n✅ ¡SCRAPER COMPLETADO!');
  console.log('📁 Resultados guardados en: talles-disponibles.json');
}

scrapeAll();
