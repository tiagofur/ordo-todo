# Estrategia de Optimización de IA y Costos (Local ML First)

## Objetivo
Maximizar la funcionalidad de inteligencia artificial minimizando los costos de APIs externas (como Gemini/OpenAI), priorizando el procesamiento local y el uso de Machine Learning ligero en el backend.

## Principios
1.  **Local-First ML:** Intentar resolver predicciones (estimaciones, clasificaciones, recomendaciones) usando algoritmos locales o estadísticas sobre los datos históricos del usuario antes de consultar una API.
2.  **Pre-procesamiento Rico:** El backend debe digerir, filtrar y estructurar los datos al máximo. A la IA generativa (LLM) solo se le debe enviar el contexto final necesario para generar texto natural o conclusiones complejas ("Insight"), no para cálculos que el código puede hacer.
3.  **Fallback Inteligente:** Usar la API externa solo cuando la confianza del modelo local sea baja o no existan suficientes datos históricos.
4.  **Batching y Caching:** Agrupar solicitudes y cachear respuestas de la IA para consultas repetitivas.

## Implementación en Funcionalidades Actuales

### 1. Estimación de Tareas (P7)
*   **Enfoque Local (Nivel 1):**
    *   Búsqueda de tareas históricas similares (Coincidencia de palabras clave TF-IDF simple en título/descripción).
    *   Cálculo del promedio de tiempo gastado (`actualDuration`) o estimado (`estimatedMinutes`) de las top-k coincidencias.
    *   Si existen >3 coincidencias con varianza baja, devolver el promedio local.
*   **Enfoque Híbrido (Nivel 2):**
    *   Si no hay historial suficiente, usar Gemini Flash.
    *   Prompt optimizado: Enviar solo título/descripción y pedir un número (Json Mode).

### 2. Reportes de Productividad
*   **Pre-procesamiento en Backend:**
    *   Calcular métricas exactas: "Total horas", "Productividad %", "Día más productivo".
    *   Detectar tendencias matemáticas: "La productividad bajó un 15% vs semana anterior".
*   **Rol del LLM:**
    *   Recibir JSON con estas conclusiones pre-calculadas.
    *   Tarea: "Redactar un parrafo motivador y explicativo basado en estos datos".
    *   *Ahorro:* Se reduce drásticamente el número de tokens de entrada (no se envían todos los logs crudos) y de salida.

### 3. Clasificación y Tags Automáticos
*   **Local:** Mantenimiento de un mapa de frecuencias "Palabra clave -> Tag".
    *   Ej: Si el usuario siempre etiqueta "bug" como `#dev`, sugerirlo automáticamente sin IA.
*   **LLM:** Solo para clasificar texto ambiguo o nuevo.

## Roadmap Técnico
1.  **Fase 1 (Actual):** Implementar heurísticas simples en Node.js (Promedios históricos) y fallback a Gemini.
2.  **Fase 2:** Implementar librería de NLP ligera local (`natural` o `node-nlp`) en backend.
3.  **Fase 3:** Microservicio Python opcional con Scikit-learn si la complejidad crece.
