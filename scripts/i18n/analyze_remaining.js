const fs = require('fs');
const path = require('path');

function findFiles(dir, exts) {
  const files = [];
  
  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // Ignorar __tests__
        if (entry.name !== '__tests__') {
          traverse(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (exts.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  traverse(dir);
  return files;
}

function extractKeys(file) {
  const content = fs.readFileSync(file, 'utf-8');
  const namespaceMatch = content.match(/useTranslations\(['"]([^'"]+)['"]\)/);
  const namespace = namespaceMatch ? namespaceMatch[1] : null;
  
  const keyMatches = content.match(/t\(['"]([^'"]+)['"]\)(?!\s*\|\|)/g) || [];
  const keys = keyMatches.map(k => k.match(/t\(['"]([^'"]+)['"]\)(?!\s*\|\|)/)[1]);
  
  return { namespace, keys, file };
}

const translations = JSON.parse(
  fs.readFileSync('packages/i18n/src/locales/en.json', 'utf-8')
);

// Categorías a analizar
const categories = {
  analytics: 'apps/web/src/components/analytics',
  shared: 'apps/web/src/components/shared',
  dashboard: 'apps/web/src/components/dashboard',
  ai: 'apps/web/src/components/ai',
  goals: 'apps/web/src/components/goals',
  habit: 'apps/web/src/components/habit',
  habit: 'apps/web/src/components/habits',
  calendar: 'apps/web/src/components/calendar',
  tag: 'apps/web/src/components/tag',
  timer: 'apps/web/src/components/timer',
  trash: 'apps/web/src/components/trash',
  tasks: 'apps/web/src/components/tasks',
  meetings: 'apps/web/src/components/meetings',
  settings: 'apps/web/src/components/settings',
  shortcuts: 'apps/web/src/components/shortcuts',
  onboarding: 'apps/web/src/components/onboarding',
  template: 'apps/web/src/components/template',
  data: 'apps/web/src/components/data',
  devtools: 'apps/web/src/components/devtools',
  auth: 'apps/web/src/components/auth',
  focus: 'apps/web/src/components/focus',
};

const falsePositives = [
  /^\s*$/, /^[a-z]$/, /^[A-Z]$/, /^T$/, /^_$/, /^:$/, /^\/$/, /^-$/, /^[0-9]+$/,
  /^@/, // Rutas
];

function isFalsePositive(key) {
  return falsePositives.some(pattern => pattern.test(key));
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║       ANÁLISIS DE COMPONENTES RESTANTES                       ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const allResults = {};

Object.entries(categories).forEach(([category, dir]) => {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  ${category.toUpperCase()}: Directorio no existe`);
    return;
  }
  
  const files = findFiles(dir, ['.tsx', '.ts']);
  
  console.log(`${'='.repeat(70)}`);
  console.log(`📁 ${category.toUpperCase()} (${files.length} archivos)`);
  console.log('='.repeat(70));
  
  const results = [];
  let categoryMissing = 0;
  
  files.forEach(file => {
    const { namespace, keys } = extractKeys(file);
    
    if (!namespace || keys.length === 0) return;
    
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
    
    const realMissing = missing.filter(k => !isFalsePositive(k));
    
    if (realMissing.length > 0) {
      const fileName = file.split('/').pop();
      results.push({
        file: fileName,
        namespace,
        totalKeys: keys.length,
        missing: realMissing
      });
      categoryMissing += realMissing.length;
      
      console.log(`\n❌ ${fileName}:`);
      console.log(`   Namespace: ${namespace}`);
      console.log(`   Faltantes: ${realMissing.length}`);
      realMissing.slice(0, 5).forEach(k => console.log(`      ✗ ${k}`));
      if (realMissing.length > 5) console.log(`      ... y ${realMissing.length - 5} más`);
    }
  });
  
  if (results.length === 0) {
    console.log(`\n✅ Todas las traducciones encontradas`);
  }
  
  allResults[category] = {
    totalFiles: files.length,
    filesWithTranslations: files.filter(f => extractKeys(f).namespace).length,
    filesWithIssues: results.length,
    missingCount: categoryMissing,
    details: results
  };
  
  console.log(`\n📊 Resumen ${category.toUpperCase()}:`);
  console.log(`   Archivos con traducciones: ${allResults[category].filesWithTranslations}/${allResults[category].totalFiles}`);
  console.log(`   Archivos con problemas: ${results.length}`);
  console.log(`   Traducciones faltantes: ${categoryMissing}\n`);
});

// Resumen global
console.log('\n' + '═'.repeat(70));
console.log('📊 RESUMEN GLOBAL');
console.log('═'.repeat(70));

let totalFiles = 0;
let totalWithTranslations = 0;
let totalWithIssues = 0;
let totalMissing = 0;

Object.entries(allResults).forEach(([category, data]) => {
  totalFiles += data.totalFiles;
  totalWithTranslations += data.filesWithTranslations;
  totalWithIssues += data.filesWithIssues;
  totalMissing += data.missingCount;
  
  const icon = data.missingCount === 0 ? '✅' : '❌';
  console.log(`\n${icon} ${category.toUpperCase()}:`);
  console.log(`   Archivos: ${data.filesWithTranslations}/${data.totalFiles}`);
  console.log(`   Faltantes: ${data.missingCount}`);
});

console.log(`\n${'='.repeat(70)}`);
console.log(`💡 TOTAL:`);
console.log(`   Archivos analizados: ${totalFiles}`);
console.log(`   Con traducciones: ${totalWithTranslations}`);
console.log(`   Con problemas: ${totalWithIssues}`);
console.log(`   Traducciones faltantes: ${totalMissing}`);
console.log('='.repeat(70));

if (totalMissing === 0) {
  console.log('\n🎉 ¡TODOS LOS COMPONENTES RESTANTES TIENEN SUS TRADUCCIONES!');
}

fs.writeFileSync('remaining_components_report.json', JSON.stringify(allResults, null, 2));
console.log(`\n💾 Reporte detallado guardado en: remaining_components_report.json\n`);

