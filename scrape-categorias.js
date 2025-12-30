const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeTalles(url) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        
        const talles = [];
        
        // Buscar los checkboxes de talles
        $('input[type="checkbox"][name*="Talles"]').each((i, elem) => {
            const value = $(elem).val();
            const numero = parseInt(value);
            if (!isNaN(numero) && numero >= 34 && numero <= 64) {
                talles.push(numero);
            }
        });
        
        // Ordenar talles
        return talles.sort((a, b) => a - b);
    } catch (error) {
        console.error(`Error scrapeando ${url}:`, error.message);
        return [];
    }
}

async function main() {
    const urls = fs.readFileSync('categorias-urls.txt', 'utf-8')
        .split('\n')
        .filter(line => line.trim());
    
    const resultado = {};
    
    for (const url of urls) {
        const nombreCategoria = url.split('/').filter(x => x).pop();
        console.log(`Scrapeando ${nombreCategoria}...`);
        
        const talles = await scrapeTalles(url);
        resultado[nombreCategoria] = talles;
        
        console.log(`✅ ${nombreCategoria}: ${talles.length} talles encontrados`);
        
        // Delay para no saturar el servidor
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    fs.writeFileSync('categorias-data.json', JSON.stringify(resultado, null, 2));
    console.log('\n✅ Archivo categorias-data.json generado exitosamente');
}

main();