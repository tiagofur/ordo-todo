const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'packages', 'i18n', 'src', 'locales');
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
const ptKeys = Object.keys(ptFlat);

const missingInEs = enKeys.filter(k => !esKeys.includes(k));
const missingInPt = enKeys.filter(k => !ptKeys.includes(k));
const extraInEs = esKeys.filter(k => !enKeys.includes(k));
const extraInPt = ptKeys.filter(k => !enKeys.includes(k));

const untranslatedEs = enKeys.filter(k => esFlat[k] === enFlat[k] && enFlat[k].length > 2);
const untranslatedPt = enKeys.filter(k => ptFlat[k] === enFlat[k] && enFlat[k].length > 2);

fs.writeFileSync('i18n_audit.json', JSON.stringify({
  missingInEs,
  missingInPt,
  extraInEs,
  extraInPt,
  untranslatedEs,
  untranslatedPt
}, null, 2));
console.log('Audit complete. Check i18n_audit.json');
