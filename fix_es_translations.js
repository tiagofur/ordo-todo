const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'packages', 'i18n', 'src', 'locales');
const esPath = path.join(localesPath, 'es.json');
let es = JSON.parse(fs.readFileSync(esPath, 'utf8'));

// Translations to apply
const translations = {
  "Sidebar.workspaces": "Espacios de Trabajo",
  "Workspaces.title": "Espacios de Trabajo",
  "Analytics.tabs.overview": "Resumen",
  "Analytics.tabs.aiInsights": "Análisis IA",
  "CreateTaskDialog.ai.magic": "Magia IA",
  "CreateProjectDialog.form.workspace": "Espacio de Trabajo *",
  "WorkspaceSelector.label": "Espacios de Trabajo",
  "WorkspaceSelector.defaultName": "Espacio de Trabajo",
  "WorkspaceSettingsDialog.tabs.general": "General",
  "AIAssistantSidebar.title": "Copiloto Ordo AI",
  "Timer.title": "Temporizador",
  "Focus.categories.cafe": "Cafetería",
  "Meetings.actionItems": "Tareas de Seguimiento",
  "Wellbeing.insights": "Análisis",
  "Mobile.calendar.title": "Bloqueo de Tiempo",
  "Mobile.home.okrsGoals": "OKRs y Objetivos",
  "ReportDetail.metrics.focusScore": "Focus Score", // Same but maybe "Puntuación de Enfoque"
  "FocusScoreGauge.label": "Focus Score", // Stay consistent
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
  setKey(es, key, value);
}

fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
console.log('Fixed Spanish translations.');
