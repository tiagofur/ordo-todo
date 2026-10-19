# ODD en Ordo: cómo se trabaja

> **Última actualización**: 2026-10-18
> **Autor/Mantenedor**: equipo Ordo
> **Estado**: 🚧 En desarrollo

## Qué es esto

`odd/tasks/` contiene los **documentos de trabajo ejecutables** del proyecto (ODD = desarrollo orientado a documentos de Orchestrator-Driven Development del sistema Gentle-AI). Cada archivo es una unidad de trabajo completa: un worker puede implementarla leyendo **solo** ese archivo + los paths exactos que cita, sin explorar el repo a ciegas.

## Anatomía de un ODD doc

```
odd/tasks/NNN-slug.md
├── Header: Objective, Branch (sugerida), Delivery strategy, Test runner
├── ## Context — paths exactos a leer primero (presupuesto cerrado, nada más)
├── ## Specs — requisitos S1..Sn con Checks (AUTORITATIVO sobre resúmenes)
├── ## Allowed edit surfaces — únicos paths escribibles
├── ## Verification — comandos exactos + resultado esperado
├── ## Tasks — unidades T1..Tn con S# linkeados, ruta sugerida, estado, evidencia
└── ## Log — L1 pedido original verbatim + correcciones verbatim con fecha
```

## Reglas (padre/orquestador)

1. **Delegación**: al delegar a un `gentle-ai-worker`, inyectar bajo `## Skills to load before work` los paths exactos de skills (p. ej. `~/.agents/skills/work-unit-commits/SKILL.md`) y del agente especialista del repo (p. ej. `.claude/agents/nestjs-backend.md`). El worker los lee antes de tocar código.
2. **Superficies**: copiar `## Allowed edit surfaces` del ODD doc al handoff. Solo el padre puede ampliarlas (y debe editar el ODD doc).
3. **Specs mandan**: pasar el localizador (`odd/tasks/NNN-slug.md`, leer hasta `## Log`) + `T#` + `S#`. Nunca re-resumir specs en el handoff.
4. **Ruta**: la columna "Ruta sugerida" es orientativa; el padre decide inline vs delegado según los triggers (presupuesto de evidencia, tamaño, riesgo).
5. **Evidencia**: al cerrar cada `T#`, actualizar su fila (estado + commit o evidencia RED/GREEN) y añadir entrada en `## Log`. Edición quirúrgica, jamás reescribir el archivo.
6. **Cambios de requisitos**: entrada verbatim en `## Log` + reescribir solo el `S#` afectado + reabrir solo su `T#`. Preservar trabajo válido.
7. **Issues**: cada ODD doc tiene su issue (ver [roadmap](../../docs/planning/roadmap.md)). La issue es el espejo humano; el ODD doc es la fuente de verdad del agente.

## Reglas (worker)

Las de `gentle-ai-worker`: leer skills inyectadas, leer el ODD doc hasta `## Log`, no salir de las superficies, test-first para comportamiento, devolver handoff con `status/summary/files_changed/tdd_evidence/validation/risks/review_focus`. Ante ambigüedad: `interaction_required`, nunca adivinar.

## Índice de tareas

Ver [docs/planning/roadmap.md](../../docs/planning/roadmap.md) (tabla ODD ↔ issue ↔ milestone). Los archivos viven en `odd/tasks/NNN-*.md`.
