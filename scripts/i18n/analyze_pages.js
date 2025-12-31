const fs = require('fs');
const glob = require('glob');

// Función para extraer claves
function extractKeys(file) {
  const content = fs.readFileSync(file, 'utf-8');
  const namespaceMatch = content.match(/useTranslations\(['"]([^'"]+)['"]\)/);
  const namespace = namespaceMatch ? namespaceMatch[1] : null;
  
  const keyMatches = content.match(/t\(['"]([^'"]+)['"]\)(?!\s*\|\|)/g) || [];
  const keys = keyMatches.map(k => k.match(/t\(['"]([^'"]+)['"]\)(?!\s*\|\|)/)[1]);
  
  return { namespace, keys, file };
}

// Cargar traducciones
const translations = JSON.parse(
  fs.readFileSync('../../../packages/i18n/src/locales/en.json', 'utf-8')
);

// Buscar todos los archivos page.tsx y layout.tsx
const pageFiles = glob.sync('../../../apps/web/src/app/[local../../../*.{tsx,ts}', {
  ignore: ['**/__tests__/**', '**/api/**', '**/*.test.*']
});

// Filtros de falsos positivos
const falsePositives = [
  /^\s*$/,
  /^[a-z]$/,
  /^[A-Z]$/,
  /^T$/,
  /^_$/,
  /^:$/,
../../../$/,
  /^-$/,
  /^[0-9]+$/,
];

function isFalsePositive(key) {
  return falsePositives.some(pattern => pattern.test(key));
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║              ANÁLISIS: PÁGINAS (pages)                      ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const results = [];
let totalMissing = 0;

console.log(`📁 Archivos encontrados: ${pageFiles.length}\n`);
console.log('Analizando...\n');

pageFiles.forEach(file => {
  const fileName = file.split('/').pop();
  const { namespace, keys } = extractKeys(file);
  
  if (!namespace || keys.length === 0) {
    return;
  }
  
  const missing = [];
  keys.forEach(key => {
    if (!isFalsePositive(key)) {
      const parts = key.split('.');
      let current = translations[namespace];
      if (current) {
        for (const part of parts) {
          if (typeof current !== 'object' || !(part in current)) {
            missing.push(key);
            return;
          }
          current = current[part];
        }
      } else {
        missing.push(key);
      }
    }
  });
  
  if (missing.length > 0) {
    const realMissing = missing.filter(k => !isFalsePositive(k));
    if (realMissing.length > 0) {
      results.push({
        file: file.replace('../../../apps/web/src/app/[locale]/', ''),
        namespace,
        totalKeys: keys.length,
        missing: realMissing
      });
      totalMissing += realMissing.length;
      
      const icon = realMissing.length === 0 ? '✅' : '❌';
      console.log(`${icon} ${file.replace('../../../apps/web/src/app/[locale]/', '')}`);
      console.log(`   Namespace: ${namespace}`);
      console.log(`   Faltantes: ${realMissing.length}`);
      realMissing.slice(0, 5).forEach(k => console.log(`      ✗ ${k}`));
      if (realMissing.length > 5) console.log(`      ... y ${realMissing.length - 5} más`);
      console.log();
    }
  }
});

console.log('═'.repeat(70));
console.log('📊 RESUMEN');
console.log('═'.repeat(70));
console.log(`Páginas analizadas: ${pageFiles.length}`);
console.log(`Páginas con traducciones: ${results.length}`);
console.log(`Traducciones faltantes: ${totalMissing}`);

if (totalMissing === 0) {
  console.log('\n🎉 ¡TODAS LAS PÁGINAS TIENEN SUS TRADUCCIONES!');
}

fs.writeFileSync('../../../pages_translations_report.json', JSON.stringify(results, null, 2));
console.log(`\n💾 Reporte guardado en: pages_translations_report.json\n`);

