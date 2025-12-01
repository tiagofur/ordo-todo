/**
 * Migration Helper Script
 *
 * This script helps identify files that still use tRPC and need migration.
 * Run with: node migration-helper.js
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const componentsToMigrate = [];
const migratedComponents = [];

function searchDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and other non-source directories
      if (!file.startsWith('.') && file !== 'node_modules') {
        searchDirectory(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(srcDir, filePath);

        // Check for tRPC usage
        const hasTRPCImport = content.includes('from "@/utils/api"');
        const hasTRPCUsage = /api\.[a-z]+\.[a-z]+\.use(Query|Mutation)/.test(content);
        const hasUseUtils = content.includes('api.useUtils()');

        // Check for REST API usage
        const hasRESTImport = content.includes('from "@/lib/api-hooks"');

        if (hasTRPCImport || hasTRPCUsage || hasUseUtils) {
          componentsToMigrate.push({
            file: relativePath,
            path: filePath,
            hasTRPCImport,
            hasTRPCUsage,
            hasUseUtils,
            hasRESTImport,
          });
        } else if (hasRESTImport) {
          migratedComponents.push(relativePath);
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }
}

console.log('🔍 Scanning for tRPC usage...\n');
searchDirectory(srcDir);

console.log('=' .repeat(80));
console.log('📊 MIGRATION STATUS');
console.log('='.repeat(80));
console.log(`\n✅ Migrated Components: ${migratedComponents.length}`);
console.log(`🔄 Components Needing Migration: ${componentsToMigrate.length}`);
console.log(`📈 Progress: ${Math.round((migratedComponents.length / (migratedComponents.length + componentsToMigrate.length)) * 100)}%\n`);

if (migratedComponents.length > 0) {
  console.log('✅ MIGRATED COMPONENTS:');
  console.log('-'.repeat(80));
  migratedComponents.forEach(file => console.log(`  ✓ ${file}`));
  console.log('');
}

if (componentsToMigrate.length > 0) {
  console.log('🔄 COMPONENTS NEEDING MIGRATION:');
  console.log('-'.repeat(80));

  // Sort by priority
  const highPriority = componentsToMigrate.filter(c =>
    c.file.includes('/tasks/') || c.file.includes('/projects/[') || c.file.includes('task-list')
  );
  const mediumPriority = componentsToMigrate.filter(c =>
    c.file.includes('task-') || c.file.includes('timer-')
  );
  const lowPriority = componentsToMigrate.filter(c =>
    !highPriority.includes(c) && !mediumPriority.includes(c)
  );

  if (highPriority.length > 0) {
    console.log('\n🔴 HIGH PRIORITY:');
    highPriority.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.file}`);
      console.log(`     - Has tRPC import: ${c.hasTRPCImport ? '✓' : '✗'}`);
      console.log(`     - Has tRPC usage: ${c.hasTRPCUsage ? '✓' : '✗'}`);
      console.log(`     - Has useUtils: ${c.hasUseUtils ? '✓' : '✗'}`);
      console.log(`     - Has REST import: ${c.hasRESTImport ? '✓' : '✗'}`);
    });
  }

  if (mediumPriority.length > 0) {
    console.log('\n🟡 MEDIUM PRIORITY:');
    mediumPriority.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.file}`);
    });
  }

  if (lowPriority.length > 0) {
    console.log('\n🟢 LOW PRIORITY:');
    lowPriority.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.file}`);
    });
  }
}

console.log('\n' + '='.repeat(80));
console.log('\n💡 NEXT STEPS:');
console.log('  1. Migrate high priority components first');
console.log('  2. Test each component after migration');
console.log('  3. Use the patterns in MIGRATION_GUIDE.md');
console.log('  4. Run this script again to track progress\n');
