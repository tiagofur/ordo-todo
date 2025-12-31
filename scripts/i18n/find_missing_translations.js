const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Función para extraer claves de traducción de un archivo
function extractTranslationKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys = new Set();
  
  // Match t('key') o t("key") con namespaces opcionales
  // Regex mejorado para capturar claves anidadas como 'form.title'
  const regex = /t\(['"]([^'"]+)['"]\)/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    keys.add(match[1]);
  }
  
  return Array.from(keys);
}

// Función para obtener todas las claves de un JSON recursivamente
function getAllKeysFromJSON(obj, prefix = '') {
  const keys = [];
  
  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys.push(...getAllKeysFromJSON(obj[key], fullPath));
      } else {
        keys.push(fullPath);
      }
    }
  }
  
  return keys;
}

// Buscar todos los archivos TSX/TS en components
const componentFiles = glob.sync('apps/web/src/components/**/*.{tsx,ts}');

console.log(`📁 Analizando ${componentFiles.length} archivos de componentes...\n`);

// Extraer todas las claves usadas en el código
const usedKeys = new Set();
componentFiles.forEach(file => {
  const keys = extractTranslationKeys(file);
  keys.forEach(key => usedKeys.add(key));
});

console.log(`🔑 Encontradas ${usedKeys.size} claves únicas en el código\n`);

// Cargar archivos de traducción
const translations = {
  en: JSON.parse(fs.readFileSync('packages/i18n/src/locales/en.json', 'utf-8')),
  es: JSON.parse(fs.readFileSync('packages/i18n/src/locales/es.json', 'utf-8')),
  'pt-br': JSON.parse(fs.readFileSync('packages/i18n/src/locales/pt-br.json', 'utf-8'))
};

// Obtener claves existentes en cada archivo
const existingKeys = {
  en: new Set(getAllKeysFromJSON(translations.en)),
  es: new Set(getAllKeysFromJSON(translations.es)),
  'pt-br': new Set(getAllKeysFromJSON(translations['pt-br']))
};

// Encontrar claves faltantes por locale
const missingByLocale = {
  en: [],
  es: [],
  'pt-br': []
};

usedKeys.forEach(key => {
  // Verificar si la clave exacta existe
  const exists = {
    en: existingKeys.en.has(key),
    es: existingKeys.es.has(key),
    'pt-br': existingKeys['pt-br'].has(key)
  };
  
  // También verificar si existe el namespace raíz
  const namespace = key.split('.')[0];
  const namespaceExists = {
    en: namespace in translations.en,
    es: namespace in translations.es,
    'pt-br': namespace in translations['pt-br']
  };
  
  if (!exists.en || !namespaceExists.en) missingByLocale.en.push(key);
  if (!exists.es || !namespaceExists.es) missingByLocale.es.push(key);
  if (!exists['pt-br'] || !namespaceExists['pt-br']) missingByLocale['pt-br'].push(key);
});

// Ordenar y eliminar duplicados
Object.keys(missingByLocale).forEach(locale => {
  missingByLocale[locale] = [...new Set(missingByLocale[locale])].sort();
});

// Mostrar resultados
console.log('═══════════════════════════════════════════════════════════════');
console.log('🔍 TRADUCCIONES FALTANTES');
console.log('═══════════════════════════════════════════════════════════════\n');

const locales = ['en', 'es', 'pt-br'];
locales.forEach(locale => {
  if (missingByLocale[locale].length > 0) {
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
      console.log(`\n  ${ns}:`);
      byNamespace[ns].forEach(key => {
        console.log(`    ✗ ${key}`);
      });
    });
    console.log('\n');
  } else {
    console.log(`✅ ${locale.toUpperCase()}: Todas las traducciones encontradas\n`);
  }
});

// Guardar resultado en JSON
const output = {
  scannedFiles: componentFiles.length,
  totalKeysUsed: usedKeys.size,
  missing: {
    en: missingByLocale.en,
    es: missingByLocale.es,
    'pt-br': missingByLocale['pt-br']
  },
  summary: {
    en: missingByLocale.en.length,
    es: missingByLocale.es.length,
    'pt-br': missingByLocale['pt-br'].length
  }
};

fs.writeFileSync('missing_translations.json', JSON.stringify(output, null, 2));
console.log('💾 Resultados guardados en: missing_translations.json');
