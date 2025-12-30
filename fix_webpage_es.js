const fs = require('fs');
const path = require('path');

const esPath = path.join(__dirname, 'apps', 'webpage', 'src', 'messages', 'es.json');
let es = JSON.parse(fs.readFileSync(esPath, 'utf8'));

es.Navigation.roadmap = "Hoja de Ruta";
es.Contact.email_label = "Correo Electrónico";

fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
console.log('Fixed Spanish webpage translations.');
