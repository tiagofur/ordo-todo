const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'apps', 'webpage', 'src', 'messages');
const en = JSON.parse(fs.readFileSync(path.join(localesPath, 'en.json'), 'utf8'));
const es = JSON.parse(fs.readFileSync(path.join(localesPath, 'es.json'), 'utf8'));
const pt = JSON.parse(fs.readFileSync(path.join(localesPath, 'pt-br.json'), 'utf8'));

function getFlattened(obj, prefix = '') {
  let result = {};
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(result, getFlattened(obj[key], fullKey));
    } else {
      result[fullKey] = obj[key];
    }
  }
  return result;
}

const enFlat = getFlattened(en);
const esFlat = getFlattened(es);
const ptFlat = getFlattened(pt);

const enKeys = Object.keys(enFlat);
const esKeys = Object.keys(esFlat);

const missingInEs = enKeys.filter(k => !esFlat[k]); // Filter keys that are missing OR empty
const untranslatedEs = enKeys.filter(k => esFlat[k] === enFlat[k] && enFlat[k].length > 2);

fs.writeFileSync('webpage_i18n_audit.json', JSON.stringify({
  missingInEs,
  untranslatedEs
}, null, 2));
console.log('Audit complete.');
