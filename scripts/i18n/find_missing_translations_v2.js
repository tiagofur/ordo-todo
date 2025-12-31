const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Función para extraer claves de traducción de un archivo
function extractTranslationKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys = new Set();
  
  // Match t('key') o t("key") - sin fallbacks
  const regex = /t\(['"]([^'"]+)['"]\)(?!\s*\|\|)/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    keys.add(match[1]);
  }
  
  return Array.from(keys);
}

// Función para verificar si una clave existe en el JSON (navegando el árbol)
function keyExistsInJSON(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) {
      return false;
    }
    if (!(part in current)) {
      return false;
    }
    current = current[part];
  }
  
  return true;
}

// Buscar archivos de componentes
const componentFiles = glob.sync('apps/web/src/components/**/*.{tsx,ts}');

console.log(`📁 Analizando ${componentFiles.length} archivos de componentes...\n`);

// Extraer todas las claves usadas en el código
const usedKeys = new Set();
componentFiles.forEach(file => {
  const keys = extractTranslationKeys(file);
  keys.forEach(key => usedKeys.add(key));
});

// Filtrar claves obviamente inválidas
const validKeys = Array.from(usedKeys).filter(key => {
  // Claves inválidas comunes
  const invalidPatterns = [
    /^[\d%+\/:,?#]+$/,  // Solo números o símbolos
    /^#[0-9A-Fa-f]{6}$/, // Colores hex
    /^@/, // Paths como @/...
    /^ordo-todo:/, // Nombres de comandos
    /^\.\s*$/, // Puntos solos
    /^\s*$/, // Vacíos
    /^\d+ [A-Z][a-z]{2}$/, // Fechas como "31 Dec"
    /\\n/, // Caracteres de escape
    /^_\w+$/, // Guiones bajos solos
  ];
  
  return !invalidPatterns.some(pattern => pattern.test(key));
});

console.log(`🔑 Claves válidas: ${validKeys.length} de ${usedKeys.size} totales\n`);

// Cargar archivos de traducción
const translations = {
  en: JSON.parse(fs.readFileSync('packages/i18n/src/locales/en.json', 'utf-8')),
  es: JSON.parse(fs.readFileSync('packages/i18n/src/locales/es.json', 'utf-8')),
  'pt-br': JSON.parse(fs.readFileSync('packages/i18n/src/locales/pt-br.json', 'utf-8'))
};

// Encontrar claves faltantes por locale
const missingByLocale = {
  en: [],
  es: [],
  'pt-br': []
};

validKeys.forEach(key => {
  const exists = {
    en: keyExistsInJSON(translations.en, key),
    es: keyExistsInJSON(translations.es, key),
    'pt-br': keyExistsInJSON(translations['pt-br'], key)
  };
  
  if (!exists.en) missingByLocale.en.push(key);
  if (!exists.es) missingByLocale.es.push(key);
  if (!exists['pt-br']) missingByLocale['pt-br'].push(key);
});

// Ordenar
Object.keys(missingByLocale).forEach(locale => {
  missingByLocale[locale].sort();
});

// Mostrar resultados
console.log('═══════════════════════════════════════════════════════════════');
console.log('🔍 TRADUCCIONES FALTANTES REALES');
console.log('═══════════════════════════════════════════════════════════════\n');

const locales = ['en', 'es', 'pt-br'];
let totalMissing = 0;

locales.forEach(locale => {
  if (missingByLocale[locale].length > 0) {
    totalMissing += missingByLocale[locale].length;
    console.log(`📄 ${locale.toUpperCase()} (${missingByLocale[locale].length} faltantes):`);
    console.log('─'.repeat(60));
    
    // Agrupar por namespace
    const byNamespace = {};
    missingByLocale[locale].forEach(key => {
      const ns = key.split('.')[0];
      if (!byNamespace[ns]) byNamespace[ns] = [];
      byNamespace[ns].push(key);
    });
    
    Object.keys(byNamespace).sort().forEach(ns => {
      console.log(`\n  📂 ${ns}:`);
      byNamespace[ns].forEach(key => {
        console.log(`    ✗ ${key}`);
      });
    });
    console.log('\n');
  } else {
    console.log(`✅ ${locale.toUpperCase()}: Todas las traducciones encontradas\n`);
  }
});

console.log(`💡 Total de claves faltantes: ${totalMissing}\n`);

// Guardar resultado en JSON
const output = {
  scannedFiles: componentFiles.length,
  totalKeysUsed: validKeys.length,
  missing: {
    en: missingByLocale.en,
    es: missingByLocale.es,
    'pt-br': missingByLocale['pt-br']
  },
  summary: {
    en: missingByLocale.en.length,
    es: missingByLocale.es.length,
    'pt-br': missingByLocale['pt-br'].length,
    total: totalMissing
  }
};

fs.writeFileSync('missing_translations_clean.json', JSON.stringify(output, null, 2));
console.log('💾 Resultados guardados en: missing_translations_clean.json');
