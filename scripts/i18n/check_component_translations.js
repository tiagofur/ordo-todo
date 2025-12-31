const fs = require('fs');
const glob = require('glob');

// Función para extraer claves de un archivo y su namespace
function extractKeysFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys = [];
  
  // Extraer el namespace de useTranslations
  const namespaceMatch = content.match(/useTranslations\(['"]([^'"]+)['"]\)/);
  const namespace = namespaceMatch ? namespaceMatch[1] : null;
  
  // Extraer todas las claves t('...')
  const regex = /t\(['"]([^'"]+)['"]\)/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    keys.push({
      key: match[1],
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  return { namespace, keys, filePath };
}

// Función para verificar si una clave existe en el JSON
function keyExistsInJSON(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return false;
    if (!(part in current)) return false;
    current = current[part];
  }
  return true;
}

// Cargar traducciones
const translations = {
  en: JSON.parse(fs.readFileSync('packages/i18n/src/locales/en.json', 'utf-8')),
  es: JSON.parse(fs.readFileSync('packages/i18n/src/locales/es.json', 'utf-8')),
  'pt-br': JSON.parse(fs.readFileSync('packages/i18n/src/locales/pt-br.json', 'utf-8'))
};

// Analizar un componente específico
function analyzeComponent(componentPath) {
  console.log('\n' + '='.repeat(70));
  console.log(`📄 ANALIZANDO: ${componentPath}`);
  console.log('='.repeat(70));
  
  const { namespace, keys, filePath } = extractKeysFromFile(componentPath);
  
  if (!namespace) {
    console.log('⚠️  No se encontró namespace (useTranslations)');
    return;
  }
  
  console.log(`📦 Namespace: ${namespace}`);
  console.log(`🔑 Total de claves: ${keys.length}\n`);
  
  // Obtener el namespace del JSON
  const nsData = translations.en[namespace];
  if (!nsData) {
    console.log(`❌ El namespace "${namespace}" NO existe en en.json`);
    console.log(`   Claves usadas que faltarían:`);
    keys.forEach(k => {
      console.log(`   - ${k.key} (línea ${k.line})`);
    });
    return;
  }
  
  console.log(`✓ Namespace existe en en.json\n`);
  
  // Verificar cada clave
  const missing = [];
  const found = [];
  
  keys.forEach(k => {
    const exists = keyExistsInJSON(nsData, k.key);
    if (exists) {
      found.push(k);
    } else {
      missing.push(k);
    }
  });
  
  if (found.length > 0) {
    console.log(`✅ Claves encontradas: ${found.length}`);
  }
  
  if (missing.length > 0) {
    console.log(`\n❌ TRADUCCIONES FALTANTES (${missing.length}):`);
    console.log('-'.repeat(70));
    missing.forEach(k => {
      console.log(`   ✗ ${k.key} (línea ${k.line})`);
    });
  } else {
    console.log('\n🎉 Todas las traducciones encontradas!');
  }
  
  return { namespace, found: found.length, missing: missing.length, missingKeys: missing };
}

// Analizar componentes específicos
const componentsToCheck = [
  'apps/web/src/components/project/project-card.tsx',
  'apps/web/src/components/project/project-list.tsx',
  'apps/web/src/components/project/project-board.tsx',
  'apps/web/src/components/project/create-project-dialog.tsx',
  'apps/web/src/components/task/create-task-dialog.tsx',
  'apps/web/src/components/task/task-detail-panel.tsx',
  'apps/web/src/components/task/task-card.tsx',
];

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║           ANÁLISIS DE TRADUCCIONES POR COMPONENTE              ║');
console.log('╚══════════════════════════════════════════════════════════════╝');

const results = {};
componentsToCheck.forEach(component => {
  try {
    const result = analyzeComponent(component);
    if (result) {
      results[component] = result;
    }
  } catch (e) {
    console.log(`\n❌ Error analizando ${component}: ${e.message}`);
  }
});

// Resumen
console.log('\n\n' + '='.repeat(70));
console.log('📊 RESUMEN GENERAL');
console.log('='.repeat(70));

let totalMissing = 0;
Object.entries(results).forEach(([component, data]) => {
  const compName = component.split('/').pop();
  if (data.missing > 0) {
    totalMissing += data.missing;
    console.log(`❌ ${compName}: ${data.missing} faltantes`);
  } else {
    console.log(`✅ ${compName}: OK`);
  }
});

console.log(`\nTotal de traducciones faltantes: ${totalMissing}\n`);
