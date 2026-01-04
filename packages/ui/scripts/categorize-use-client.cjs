const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const componentsDir = 'src/components';

// Find all files with 'use client'
const files = execSync(`grep -r "'use client'" ${componentsDir} --files-with-matches --include="*.tsx"`, { encoding: 'utf8' })
  .split('\n')
  .filter(f => f);

const results = files.map(file => {
  const content = fs.readFileSync(file, 'utf8');
  const hooks = {
    useState: (content.match(/useState/g) || []).length,
    useEffect: (content.match(/useEffect/g) || []).length,
    useCallback: (content.match(/useCallback/g) || []).length,
    useMemo: (content.match(/useMemo/g) || []).length,
    useRef: (content.match(/useRef/g) || []).length,
    useForm: (content.match(/useForm/g) || []).length,
    useRouter: (content.match(/useRouter/g) || []).length,
    useSearchParams: (content.match(/useSearchParams/g) || []).length,
  };

  const totalHooks = Object.values(hooks).reduce((a, b) => a + b, 0);

  return {
    file,
    totalHooks,
    hooks,
    category: totalHooks === 0 ? 'B (Remover use client)' : 'A (Mover a apps/web)'
  };
});

// Group by category
const categoryA = results.filter(r => r.category.includes('A'));
const categoryB = results.filter(r => r.category.includes('B'));

console.log('\n=== CATEGORÍA A: MOVER A APPS/WEB (con hooks) ===');
categoryA.forEach(r => {
  console.log(`${r.file}`);
  console.log(`  Hooks: ${r.totalHooks}`, r.hooks);
});

console.log(`\n=== CATEGORÍA B: REMOVER 'USE CLIENT' (sin hooks) ===`);
categoryB.forEach(r => {
  console.log(`${r.file}`);
});

console.log(`\n=== RESUMEN ===`);
console.log(`Total archivos: ${results.length}`);
console.log(`Categoría A (mover): ${categoryA.length}`);
console.log(`Categoría B (remover): ${categoryB.length}`);
