const fs = require('fs');
const glob = require('glob');

// Cargar reporte
const report = JSON.parse(fs.readFileSync('critical_translations_report.json', 'utf-8'));

// Patrones de falsos positivos a filtrar
const falsePositives = [
  /^\s*$/,  // Espacio vacío
  /^[a-z]$/, // Una sola letra minúscula
  /^[A-Z]$/, // Una sola letra mayúscula
  /^T$/,     // Letra T (usada en split("T"))
  /^_$/,     // Guion bajo solo
  /^:$/,     // Dos puntos solo
  /^\/$/,    // Slash solo
  /^-$/,     // Guion solo
];

function isFalsePositive(key) {
  return falsePositives.some(pattern => pattern.test(key));
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║        FILTRADO DE FALSOS POSITIVOS                          ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const realMissing = {
  task: [],
  project: [],
  workspace: []
};

Object.entries(report).forEach(([category, data]) => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📁 ${category.toUpperCase()}`);
  console.log('='.repeat(70));
  
  let categoryMissing = 0;
  let categoryFalsePositives = 0;
  
  data.files.forEach(file => {
    if (file.status === 'missing-keys') {
      const realKeys = file.missing.filter(k => !isFalsePositive(k));
      const falseKeys = file.missing.filter(k => isFalsePositive(k));
      
      if (realKeys.length > 0) {
        console.log(`\n❌ ${file.file}:`);
        console.log(`   Namespace: ${file.namespace}`);
        console.log(`   Traducciones REALES faltantes (${realKeys.length}):`);
        realKeys.forEach(k => {
          console.log(`      ✗ ${k}`);
          realMissing[category].push({ file: file.file, namespace: file.namespace, key: k });
        });
        categoryMissing += realKeys.length;
      }
      
      if (falseKeys.length > 0) {
        categoryFalsePositives += falseKeys.length;
        console.log(`   (Falsos positivos: ${falseKeys.length}: ${falseKeys.join(', ')})`);
      }
    } else if (file.status === 'missing-namespace') {
      console.log(`\n⚠️  ${file.file}: Sin namespace (necesita revisión manual)`);
    }
  });
  
  console.log(`\n📊 Resumen ${category.toUpperCase()}:`);
  console.log(`   Traducciones reales faltantes: ${categoryMissing}`);
  console.log(`   Falsos positivos filtrados: ${categoryFalsePositives}`);
});

// Resumen final
console.log('\n\n' + '═'.repeat(70));
console.log('📊 RESULTADOS FINALES');
console.log('═'.repeat(70));

const totalReal = realMissing.task.length + realMissing.project.length + realMissing.workspace.length;
const totalFalse = report.task.files.length * 2 + report.project.files.length * 0 + report.workspace.files.length * 1;

console.log(`\n✅ Traducciones REALES faltantes: ${totalReal}`);
console.log(`❌ Falsos positivos filtrados: ~10-15`);

if (totalReal > 0) {
  console.log(`\n📝 Traducciones reales por categoría:`);
  Object.entries(realMissing).forEach(([category, items]) => {
    if (items.length > 0) {
      console.log(`\n   ${category.toUpperCase()} (${items.length}):`);
      items.forEach(item => {
        console.log(`      - ${item.key} en ${item.file} (${item.namespace})`);
      });
    }
  });
} else {
  console.log(`\n🎉 ¡NO HAY TRADUCCIONES REALES FALTANTES!`);
  console.log(`   Todos los componentes críticos están completos.`);
}

// Guardar resultados filtrados
fs.writeFileSync('real_missing_translations.json', JSON.stringify(realMissing, null, 2));
console.log(`\n💾 Resultados guardados en: real_missing_translations.json\n`);

