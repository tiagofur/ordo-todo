const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'packages', 'i18n', 'src', 'locales');
const enPath = path.join(localesPath, 'en.json');
let en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const missingInEn = {
  "WorkspaceMembersSettings.memberRemoved": "Member removed",
  "WorkspaceMembersSettings.errorRemoving": "Error removing member",
  "WorkspaceMembersSettings.noMembers": "No members",
  "TaskDetailPanel.details.addAnotherGoal": "Add another goal",
  "TaskDetailPanel.details.selectGoal": "Select Key Result",
  "TaskDetailPanel.details.noActiveObjectives": "No active objectives",
  "Goals.notFound": "Goal not found",
  "Goals.edit": "Edit",
  "Goals.keyResults.subtitle": "Define metrics to measure your progress",
  "Goals.keyResults.addFirst": "Add first key result",
  "Goals.keyResults.empty": "No key results. Add one to start measuring your progress.",
  "Goals.keyResults.createTitle": "Add Key Result",
  "Goals.keyResults.createDescription": "Define a measurable result for your goal",
  "Goals.keyResults.confirmDelete": "Delete this key result?",
  "Goals.keyResults.deleted": "Key result deleted",
  "Goals.keyResults.form.title": "Title",
  "Goals.keyResults.form.titlePlaceholder": "e.g. Increase monthly sales",
  "Goals.keyResults.form.description": "Description",
  "Goals.keyResults.form.descriptionPlaceholder": "Describe how you will measure progress...",
  "Goals.keyResults.form.metricType": "Metric type",
  "Goals.keyResults.form.startValue": "Start value",
  "Goals.keyResults.form.targetValue": "Target value",
  "Goals.keyResults.form.unit": "Unit",
  "Goals.keyResults.form.unitPlaceholder": "e.g. sales, users, hours",
  "Goals.keyResults.actions.cancel": "Cancel",
  "Goals.keyResults.actions.create": "Create",
  "Goals.keyResults.actions.creating": "Creating...",
  "Goals.keyResults.validation.titleRequired": "Title is required",
  "Goals.keyResults.toast.created": "Key result created",
  "Goals.keyResults.toast.error": "Error creating key result"
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

for (const [key, value] of Object.entries(missingInEn)) {
  setKey(en, key, value);
}

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
console.log('Synchronized English translations.');
