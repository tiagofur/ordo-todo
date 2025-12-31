#!/bin/bash

# Mover archivos de documentación a docs/
mkdir -p docs/review-examples
mkdir -p docs/i18n-analysis

# Mover archivos de review examples
mv REVIEW_EXAMPLES/* docs/review-examples/
rmdir REVIEW_EXAMPLES

# Mover archivos de documentación
mv AGENTS.md docs/
mv CRITICAL_COMPLETE.md docs/i18n-analysis/
mv FINAL_SUMMARY.md docs/i18n-analysis/
mv I18N_COMPLETE.md docs/i18n-analysis/
mv WORKSPACE_REVIEW_SUMMARY.md docs/i18n-analysis/

# Eliminar JSONs duplicados (ya existen en scripts/i18n/)
rm missing_translations.json
rm missing_translations_clean.json

echo "✅ Archivos limpiados y organizados"
