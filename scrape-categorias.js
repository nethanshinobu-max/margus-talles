const { JSDOM } = require('jsdom');

async function scrapeTalles(url) {
    try {
        console.log(`📡 Scrapeando: ${url}`);
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;
        
        const talles = new Set();
        
        // Método 1: Buscar checkboxes con name="Talles"
        const checkboxes = document.querySelectorAll('input[type="checkbox"][name*="Talles"]');
        checkboxes.forEach(checkbox => {
            const value = parseInt(checkbox.value);
            if (!isNaN(value) && value >= 34 && value <= 64) {
                talles.add(value);
            }
        });
        
        // Método 2: Buscar en labels
        const labels = document.querySelectorAll('label');
        labels.forEach(label => {
            const text = label.textContent.trim();
            const numero = parseInt(text);
            if (!isNaN(numero) && numero >= 34 && numero <= 64) {
                const checkbox = label.previousElementSibling;
                if (checkbox && checkbox.type === 'checkbox') {
                    talles.add(numero);
                }
            }
        });
        
        return Array.from(talles).sort((a, b) => a - b);
        
    } catch (error) {
        console.error(`❌ Error scrapeando ${url}:`, error.message);
        return [];
    }
}

async function main() {
    console.log('🚀 Iniciando scraper de categorías...\n');
    
    const fs = require('fs');
    const urls = fs.readFileSync('categorias-urls.txt', 'utf-8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    console.log(`📋 Total de categorías a scrapear: ${urls.length}\n`);
    
    const resultado = {};
    
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const nombreCategoria = url.split('/').filter(x => x).pop();
        
        console.log(`[${i + 1}/${urls.length}] Procesando: ${nombreCategoria}`);
        
        const talles = await scrapeTalles(url);
        resultado[nombreCategoria] = talles;
        
        console.log(`✅ ${nombreCategoria}: ${talles.length} talles encontrados`);
        if (talles.length > 0) {
            console.log(`   Talles: ${talles.join(', ')}`);
        }
        console.log('');
        
        // Delay para no saturar el servidor
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    fs.writeFileSync('categorias-data.json', JSON.stringify(resultado, null, 2));
    console.log('\n✅ Archivo categorias-data.json generado exitosamente');
    console.log(`📊 Total categorías procesadas: ${Object.keys(resultado).length}`);
}

main().catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
});
