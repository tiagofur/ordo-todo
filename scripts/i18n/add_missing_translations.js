const fs = require('fs');

// Traducciones faltantes encontradas
const missingTranslations = {
  en: {
    'CreateTaskDialog.form': {
      'selectAssignee': 'Select assignee (optional)',
      'workspaceMembers': 'Workspace members',
      'assignToMe': 'Assign to me (default)'
    }
  },
  es: {
    'CreateTaskDialog.form': {
      'selectAssignee': 'Seleccionar miembro (opcional)',
      'workspaceMembers': 'Miembros del workspace',
      'assignToMe': 'Asignarme a mí (por defecto)'
    }
  },
  'pt-br': {
    'CreateTaskDialog.form': {
      'selectAssignee': 'Selecionar membro (opcional)',
      'workspaceMembers': 'Membros do workspace',
      'assignToMe': 'Atribuir a mim (padrão)'
    }
  }
};

// Función para agregar traducciones a un archivo
function addTranslations(filePath, translations) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // Agregar cada traducción
  Object.entries(translations).forEach(([namespacePath, value]) => {
    const parts = namespacePath.split('.');
    let current = data;
    
    // Navegar hasta el namespace padre
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    // Agregar el valor
    const lastPart = parts[parts.length - 1];
    if (!current[lastPart]) {
      current[lastPart] = {};
    }
    
    // Fusionar con las claves faltantes
    Object.assign(current[lastPart], value);
  });
  
  return data;
}

// Procesar cada archivo
const locales = ['en', 'es', 'pt-br'];
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║          AGREGANDO TRADUCCIONES FALTANTES                      ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

locales.forEach(locale => {
  const filePath = `packages/i18n/src/locales/${locale}.json`;
  console.log(`📝 Procesando ${locale.toUpperCase()}...`);
  
  const updatedData = addTranslations(filePath, missingTranslations[locale]);
  
  // Guardar con formato bonito
  fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2) + '\n');
  
  console.log(`   ✅ ${filePath} actualizado`);
  
  // Mostrar las claves agregadas
  const formTranslations = missingTranslations[locale]['CreateTaskDialog.form'];
  Object.entries(formTranslations).forEach(([key, value]) => {
    console.log(`      + CreateTaskDialog.form.${key}: "${value}"`);
  });
  console.log();
});

console.log('═══════════════════════════════════════════════════════════════');
console.log('✅ Traducciones agregadas exitosamente!');
console.log('═══════════════════════════════════════════════════════════════');
