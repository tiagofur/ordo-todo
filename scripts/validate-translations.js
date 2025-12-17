const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m"
};

const localesDir = path.resolve(__dirname, '../packages/i18n/src/locales');
const sourceLocale = 'en';
const targetLocales = ['es', 'pt-br'];

console.log(`${colors.blue}Starting translation validation...${colors.reset}\n`);

try {
  const sourcePath = path.join(localesDir, `${sourceLocale}.json`);
  if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source locale file not found: ${sourcePath}`);
  }
  
  const sourceContent = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
  const sourceKeys = new Set(getKeys(sourceContent));
  
  let hasErrors = false;

  targetLocales.forEach(locale => {
    const targetPath = path.join(localesDir, `${locale}.json`);
    if (!fs.existsSync(targetPath)) {
        console.error(`${colors.red}❌ Missing locale file: ${targetPath}${colors.reset}`);
        hasErrors = true;
        return;
    }

    const targetContent = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
    const targetKeys = new Set(getKeys(targetContent));

    // Check for missing keys
    const missing = [...sourceKeys].filter(k => !targetKeys.has(k));
    if (missing.length > 0) {
      console.error(`${colors.red}❌ ${locale} is missing ${missing.length} keys:${colors.reset}`);
      missing.slice(0, 10).forEach(k => console.error(`  - ${k}`));
      if (missing.length > 10) console.error(`  ...and ${missing.length - 10} more.`);
      hasErrors = true;
    }

    // Check for extra keys
    const extra = [...targetKeys].filter(k => !sourceKeys.has(k));
    if (extra.length > 0) {
      console.warn(`${colors.yellow}⚠️  ${locale} has ${extra.length} extra keys (deprecated?):${colors.reset}`);
       extra.slice(0, 5).forEach(k => console.warn(`  - ${k}`));
       if (extra.length > 5) console.warn(`  ...and ${extra.length - 5} more.`);
    }
    
    if (missing.length === 0) {
        console.log(`${colors.green}✅ ${locale} is complete.${colors.reset}`);
    }
    console.log('');
  });

  if (hasErrors) {
    console.error(`${colors.red}Validation failed. Please fix missing translations.${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${colors.green}All translations are valid!${colors.reset}`);
  }

} catch (err) {
  console.error(`${colors.red}Error validating translations:${colors.reset}`, err);
  process.exit(1);
}

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}
