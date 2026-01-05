const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'packages', 'i18n', 'src', 'locales');
const ptPath = path.join(localesPath, 'pt-br.json');
let pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'));

const translations = {
  "WorkspaceMembersSettings.memberRemoved": "Membro removido",
  "WorkspaceMembersSettings.errorRemoving": "Erro ao remover membro",
  "WorkspaceMembersSettings.noMembers": "Nenhum membro",
  "TaskDetailPanel.details.addAnotherGoal": "Adicionar outro objetivo",
  "TaskDetailPanel.details.selectGoal": "Selecionar Resultado Chave",
  "TaskDetailPanel.details.noActiveObjectives": "Nenhum objetivo ativo",
  "Goals.keyResults.subtitle": "Defina métricas para medir seu progresso",
  "Goals.keyResults.addFirst": "Adicionar primeiro resultado chave",
  "Goals.keyResults.empty": "Nenhum resultado chave. Adicione um para começar a medir seu progresso.",
  "Goals.keyResults.createTitle": "Adicionar Resultado Chave",
  "Goals.keyResults.createDescription": "Defina um resultado mensurável para seu objetivo",
  "Goals.keyResults.confirmDelete": "Excluir este resultado chave?",
  "Goals.keyResults.deleted": "Resultado chave excluído",
  "Goals.keyResults.form.title": "Título",
  "Goals.keyResults.form.titlePlaceholder": "Ex: Aumentar vendas mensais",
  "Goals.keyResults.form.description": "Descrição",
  "Goals.keyResults.form.descriptionPlaceholder": "Descreva como você medirá o progresso...",
  "Goals.keyResults.form.metricType": "Tipo de métrica",
  "Goals.keyResults.form.startValue": "Valor inicial",
  "Goals.keyResults.form.targetValue": "Valor alvo",
  "Goals.keyResults.form.unit": "Unidade",
  "Goals.keyResults.form.unitPlaceholder": "Ex: vendas, usuários, horas",
  "Goals.keyResults.actions.cancel": "Cancelar",
  "Goals.keyResults.actions.create": "Criar",
  "Goals.keyResults.actions.creating": "Criando...",
  "Goals.keyResults.validation.titleRequired": "O título é obrigatório",
  "Goals.keyResults.toast.created": "Resultado chave criado",
  "Goals.keyResults.toast.error": "Erro ao criar resultado chave",
  "Goals.notFound": "Objetivo não encontrado",
  "Goals.edit": "Editar"
};

function setKey(obj, keyPath, value) {
  const parts = keyPath.split('.');
  const lastPart = parts.pop();
  let current = obj;
  for (const part of parts) {
    if (!current[part]) current[part] = {};
    current = current[part];
  }
  current[lastPart] = value;
}

for (const [key, value] of Object.entries(translations)) {
  setKey(pt, key, value);
}

fs.writeFileSync(ptPath, JSON.stringify(pt, null, 2));
console.log('Synchronized Portuguese translations.');
