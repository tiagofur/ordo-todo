# Product Requirements Document (PRD)

## Ordo-Todo: The Modern Task Organization Platform

---

## 1. Vision & Overview

### 1.1 Product Vision

Ordo-Todo es una aplicación de gestión de tareas de próxima generación que combina simplicidad, elegancia y poder tecnológico. Nuestro objetivo es crear la herramienta de productividad definitiva que ayude a las personas a organizar su vida profesional y personal sin abrumarlas con complejidad innecesaria.

### 1.2 Propuesta de Valor

- **Simplicidad Inteligente**: Funcionalidad potente con una interfaz minimalista
- **IA como Copiloto**: Asistente inteligente que ayuda sin interrumpir
- **Flexibilidad sin Complejidad**: Adaptable a diferentes flujos de trabajo sin configuraciones abrumadoras
- **Multiplataforma Verdadera**: Experiencia nativa en web, móvil y escritorio

### 1.3 Público Objetivo

- Profesionales que manejan múltiples proyectos
- Equipos pequeños y medianos (2-20 personas)
- Estudiantes y académicos
- Freelancers y emprendedores
- Personas que buscan balance vida-trabajo

---

## 2. Arquitectura de Producto

### 2.1 Plataformas

- **Web App**: React/Next.js (PWA-ready)
- **Mobile**: React Native (iOS & Android)
- **Desktop**: Electron (Windows, macOS, Linux)
- **Backend**: Node.js/TypeScript con arquitectura serverless

### 2.2 Sincronización

- Real-time sync entre dispositivos
- Modo offline con sincronización automática
- Resolución inteligente de conflictos

---

## 3. Arquitectura de Información

### 3.1 Jerarquía de Organización

```
Usuario
├── Espacios de Trabajo (Workspaces)
│   ├── Personal
│   ├── Trabajo
│   └── Equipos (compartidos)
│
└── Workflows (Flujos de Trabajo)
    └── Proyectos (OBLIGATORIO para cada tarea)
        └── Listas/Categorías
            └── Tareas
                ├── Sub-tareas
                └── Checklist items
```

### 3.2 Estructura de Tarea

**Campos Core:**

- Título (requerido)
- Proyecto (requerido)
- Descripción (markdown support)
- Fecha de vencimiento
- Prioridad (Baja, Media, Alta, Urgente)
- Estado (Por hacer, En progreso, Completada)
- Tiempo estimado
- Etiquetas/Tags
- Archivos adjuntos

**Campos Avanzados:**

- Dependencias (tareas bloqueadas por otras)
- Recurrencia (diaria, semanal, mensual, custom)
- Asignación (para equipos)
- Comentarios/Notas

---

## 4. Funcionalidades Core

### 4.1 Gestión de Tareas

#### Creación Rápida

- Quick-add desde cualquier pantalla (shortcut global)
- Captura por voz
- Parsing inteligente de lenguaje natural
  - "Reunión con cliente mañana 3pm #trabajo @alta"
  - IA extrae: fecha, hora, etiqueta, prioridad

#### Vistas Flexibles

1. **Vista Lista** (default)

   - Agrupación por: proyecto, fecha, prioridad, etiqueta
   - Filtros múltiples combinables
   - Ordenamiento drag & drop

2. **Vista Kanban**

   - Columnas personalizables
   - Límites de WIP (Work in Progress)
   - Métricas visuales

3. **Vista Calendario**

   - Mensual, semanal, diaria
   - Time-blocking visual
   - Integración con calendarios externos

4. **Vista Timeline** (Gantt ligero)

   - Para proyectos con dependencias
   - Visualización de path crítico

5. **Vista Enfoque** (Focus Mode)
   - Muestra solo la siguiente tarea más importante
   - Distracciones minimizadas

### 4.2 Sistema de Tiempo

#### Configuración Global

**Modos de Trabajo (se aplica a todas las tareas):**

1. **Modo Pomodoro**

   - Trabajo: 25 min (configurable: 15-50 min)
   - Descanso corto: 5 min (configurable: 3-15 min)
   - Descanso largo: 15 min (configurable: 10-30 min)
   - Intervalo para descanso largo: cada 4 pomodoros

2. **Modo Tiempo Corrido**

   - Timer continuo sin interrupciones
   - Pausas manuales cuando el usuario desee

3. **Modo Híbrido**
   - Pomodoro con flexibilidad de saltear descansos
   - Sugerencias inteligentes de pausas basadas en tiempo trabajado

**Características del Timer:**

- Notificaciones no invasivas
- Sonidos personalizables (o silencioso)
- Integración con música/ambient sounds (opcional)
- Auto-inicio de siguiente tarea (configurable)
- Registro automático de tiempo trabajado

### 4.3 Separación de Contextos

#### Espacios de Trabajo (Workspaces)

**Personal**

- Privado, solo del usuario
- Tareas domésticas, metas personales, hobbies
- Color theme: azul/verde

**Trabajo**

- Tareas profesionales individuales
- Proyectos laborales
- Color theme: gris/profesional

**Equipos** (compartidos)

- Colaboración en tiempo real
- Permisos granulares (admin, editor, viewer)
- Cada miembro ve su vista personalizada
- Color theme: customizable por equipo

**Cambio de Contexto:**

- Switcher rápido (keyboard shortcut)
- Indicador visual claro del espacio activo
- Notificaciones separadas por espacio
- Estadísticas independientes

---

## 5. Funcionalidades de IA

### 5.1 Asistente Inteligente "Ordo AI"

#### Smart Scheduling

- Sugiere mejor momento para tareas basado en:
  - Patrones históricos de productividad
  - Complejidad de la tarea
  - Deadlines existentes
  - Energía típica del usuario (mañana vs tarde)

#### Auto-Categorización

- Analiza título y descripción
- Sugiere proyecto, etiquetas, prioridad
- Aprende de correcciones del usuario

#### Estimación de Tiempo

- Predice duración basada en tareas similares
- Mejora con feedback del usuario
- Alerta si agenda está sobrecargada

#### Priorización Inteligente

- Algoritmo que considera:
  - Urgencia vs Importancia (Matriz Eisenhower)
  - Dependencies
  - Impacto en objetivos
  - Energía requerida
- Genera "Próximas 3 tareas" recomendadas

#### Detección de Patrones

- Identifica tareas recurrentes no marcadas
- Sugiere automatizaciones
- Detecta cuellos de botella en proyectos

#### Resúmenes Inteligentes

- Daily brief matutino personalizado
- Weekly review automático
- Insights sobre productividad

#### Natural Language Processing

- Creación de tareas por voz o texto natural
- Búsqueda semántica (no solo keywords)
- Comandos conversacionales: "Muéstrame tareas de marketing de alta prioridad"

### 5.2 Automatizaciones con IA

- Auto-rescheduling de tareas perdidas
- Sugerencias de delegación en equipos
- Detección de burnout y sugerencias de descanso
- Templates inteligentes para tareas repetitivas

---

## 6. Métricas & Analytics

### 6.1 Dashboard Personal

**Métricas Clave:**

- Tareas completadas (hoy, semana, mes)
- Racha de días productivos (streak)
- Tiempo total trabajado (Pomodoros completados)
- Tasa de completación (vs creadas)
- Distribución por proyecto/etiqueta
- Progreso hacia objetivos

**Visualizaciones:**

- Gráfico de productividad semanal (heatmap)
- Distribución de tiempo por categoría (pie chart)
- Tendencia de tareas completadas (line chart)
- Velocidad del equipo (para workspaces compartidos)

### 6.2 Insights Accionables

- "Completas 40% más tareas los martes por la mañana"
- "Proyecto X lleva 2 semanas sin progreso"
- "Has trabajado 15% más esta semana que la anterior"
- "Mejor racha: 12 días consecutivos"

### 6.3 Reports

- Exportables en PDF/CSV
- Time tracking detallado
- Progreso de proyectos
- Productividad del equipo
- Cumplimiento de deadlines

---

## 7. Diseño UI/UX

### 7.1 Principios de Diseño

**1. Claridad sobre Densidad**

- Espacios en blanco generosos
- Tipografía legible (sistema + custom)
- Jerarquía visual clara

**2. Progresive Disclosure**

- Funciones avanzadas ocultas hasta necesarias
- Tooltips contextuales
- Onboarding interactivo (ver sección 7.5)

**3. Consistencia Multiplataforma**

- Design system unificado
- Adaptación a patrones nativos (Material/iOS/Windows)
- Shortcuts consistentes

**4. Accesibilidad First**

- WCAG 2.1 AA compliance
- Keyboard navigation completa
- Screen reader support
- Alto contraste disponible

### 7.2 Paleta de Colores

**Tema Claro (default):**

- Primary: Azul profundo (#2563EB)
- Secondary: Verde esmeralda (#10B981)
- Background: Blanco humo (#F9FAFB)
- Surface: Blanco puro (#FFFFFF)
- Text: Gris oscuro (#111827)

**Tema Oscuro:**

- Primary: Azul brillante (#3B82F6)
- Secondary: Verde menta (#34D399)
- Background: Gris casi negro (#0F172A)
- Surface: Gris oscuro (#1E293B)
- Text: Gris muy claro (#F1F5F9)

**Código de Prioridad:**

- Urgente: Rojo (#EF4444)
- Alta: Naranja (#F59E0B)
- Media: Azul (#3B82F6)
- Baja: Gris (#6B7280)

### 7.3 Layout & Navigation

**Sidebar (Desktop)**

- Colapsible
- Quick access a workspaces
- Búsqueda global prominente
- Timer widget siempre visible

**Bottom Navigation (Mobile)**

- 5 tabs max: Hoy, Proyectos, Calendario, Estadísticas, Más
- Floating Action Button para quick-add

**Top Bar**

- Workspace switcher
- Notificaciones
- Perfil & settings
- Command palette (Cmd+K / Ctrl+K)

### 7.4 Microinteracciones

- Checkbox satisfaction (animación al completar)
- Drag & drop fluido con feedback
- Loading states informativos
- Confetti en logros/streaks
- Sonidos sutiles (opcionales)

### 7.5 Estrategia de Onboarding

**Flujo de Onboarding (5 pasos - <3 minutos):**

**Paso 1: Bienvenida y Configuración de Perfil**

- Nombre y avatar (opcional)
- Zona horaria (auto-detectada)
- Idioma preferido

**Paso 2: Selección de Workspace Inicial**

- ¿Para qué usarás Ordo-Todo principalmente?
  - Personal / Trabajo / Ambos
- Crear primer workspace con nombre

**Paso 3: Primera Tarea Guiada**

- Tutorial interactivo: crear primera tarea
- Demostración de NLP ("Reunión con cliente mañana 3pm")
- Introducción a atajos de teclado básicos

**Paso 4: Configuración del Timer**

- Selección de modo preferido (Pomodoro/Continuo/Híbrido)
- Demo de 30 segundos del timer
- Configurar sonidos/notificaciones

**Paso 5: Tour de la Aplicación**

- Overlay interactivo sobre la UI real
- Tooltips en elementos principales
- Presentación del asistente Ordo AI

**Elementos de Onboarding Adicionales:**

- Progress indicator visible en todo momento
- Opción "Saltar" (no recomendada pero disponible)
- Checklist de "Primeros Pasos" persistente en dashboard (primeras 48h)
- Emails de onboarding automatizados (día 1, 3, 7)
- Logros por completar onboarding (gamificación)

**Onboarding para Equipos:**

- Flujo adicional para administradores
- Invitación masiva por email/CSV
- Roles y permisos explicados
- Templates de proyectos de equipo sugeridos

### 7.6 Accesibilidad Detallada

**Compliance WCAG 2.1 AA:**

**Perceivable:**

- Contraste de color ≥ 4.5:1 para texto normal
- Contraste ≥ 3:1 para elementos UI grandes
- Alternativas de texto para todos los iconos
- Subtítulos para contenido de video (tutoriales)

**Operable:**

- Navegación completa por teclado
- Sin trampas de teclado
- Tiempo ajustable para acciones temporizadas
- Skip links para navegación rápida

**Understandable:**

- Idioma declarado en HTML
- Etiquetas claras para todos los inputs
- Mensajes de error descriptivos y sugerencias
- Comportamiento predecible de navegación

**Robust:**

- Markup válido y semántico
- ARIA landmarks y labels
- Compatible con lectores de pantalla principales

**Modo de Alto Contraste:**

- Tema de alto contraste dedicado
- Colores WCAG AAA (7:1 ratio)
- Bordes más gruesos para elementos interactivos
- Iconos con mayor peso visual

**Reducción de Movimiento:**

- Respeto a `prefers-reduced-motion`
- Animaciones deshabilitadas o reducidas
- Transiciones instantáneas
- Confetti y celebraciones opcionales

**Otras Características de Accesibilidad:**

- Soporte para modo oscuro/claro
- Tamaño de fuente ajustable (hasta 200%)
- Espaciado de línea personalizable
- Compatibilidad con Dragon NaturallySpeaking
- Modo de lectura para descripciones largas

---

## 8. Funcionalidades Distintivas

### 8.1 "Energy Matching"

- Usuario establece niveles de energía típicos (mañana/tarde/noche)
- Tareas tienen "energía requerida" (mental/física/creativa)
- IA empareja tareas con momentos óptimos

### 8.2 "Focus Shield"

- Modo que bloquea notificaciones externas
- Website blocker integrado (configurable)
- "Do Not Disturb" sincronizado entre dispositivos

### 8.3 "Weekly Review Asistida"

- Guía paso a paso al estilo GTD
- IA pre-llena sugerencias
- Establece intenciones para próxima semana

### 8.4 "Objetivo del Día"

- Usuario o IA elige "Una Gran Cosa" cada día
- Destacada visualmente
- Celebración especial al completar

### 8.5 "Templates Inteligentes"

- Biblioteca de templates para proyectos comunes
- Generación de templates por IA desde descripción
- Templates compartibles en equipos

### 8.6 "Integrations Hub"

- Gmail/Outlook: Convertir emails en tareas
- Calendar: Sincronización bidireccional
- Slack/Teams: Crear tareas desde mensajes
- GitHub/Jira: Importar issues
- Zapier/Make: Automatizaciones custom

---

## 9. Arquitectura Técnica

### 9.1 Stack Tecnológico

**Frontend:**

- React 18+ con TypeScript
- Next.js 14 (App Router)
- TailwindCSS + Headless UI
- Framer Motion (animaciones)
- React Query (estado del servidor)
- Zustand (estado local)

**Mobile:**

- React Native + Expo
- Native animations (Reanimated)
- Compartir componentes con web

**Backend:**

- Node.js + TypeScript
- REST API (Standard JSON)
- PostgreSQL (datos relacionales)
- Redis (cache & real-time)
- Prisma ORM

**IA/ML:**

- OpenAI API (GPT-4 para NLP)
- TensorFlow.js (ML en cliente)
- Vector DB para embeddings (Pinecone)

**Infraestructura:**

- Vercel (frontend)
- Railway/Supabase (backend)
- Cloudflare (CDN + edge functions)
- S3 (archivos adjuntos)

### 9.2 Seguridad & Privacidad

- End-to-end encryption para datos sensibles
- Zero-knowledge architecture (opcional)
- GDPR/CCPA compliant (ver sección 9.4)
- 2FA obligatorio para equipos
- Logs de auditoría
- Data residency options (EU/US/ASIA)

### 9.3 Internacionalización (i18n)

**Idiomas Soportados:**

**Fase 1 (MVP):**

- Inglés (en-US) - Default
- Español (es-ES, es-MX)
- Portugués (pt-BR)

**Fase 2 (V1.0):**

- Francés (fr-FR)
- Alemán (de-DE)
- Italiano (it-IT)

**Fase 3 (V1.5+):**

- Japonés (ja-JP)
- Coreano (ko-KR)
- Chino Simplificado (zh-CN)
- Árabe (ar-SA) - RTL support

**Implementación Técnica:**

- Framework: next-intl / react-i18next
- Formato de archivos: JSON estructurado por namespace
- Interpolación de variables y pluralización
- Fechas y números localizados (Intl API)
- Moneda adaptada por región

**Flujo de Localización:**

1. Strings en inglés como base
2. Extracción automática con i18n-scanner
3. Traducción via Crowdin/Lokalise
4. Review por hablantes nativos
5. QA automatizado de completitud

**Consideraciones:**

- Expansión de texto (alemán +30%)
- Soporte RTL para árabe/hebreo
- Formatos de fecha regionales
- Primer día de semana configurable
- Zonas horarias y DST

### 9.4 Compliance Detallado (GDPR/CCPA)

**GDPR - Regulación General de Protección de Datos:**

**Derecho de Acceso (Art. 15):**

- Dashboard de "Mis Datos" en configuración
- Vista completa de datos almacenados
- Historial de actividad descargable

**Derecho de Rectificación (Art. 16):**

- Edición de todos los datos personales
- Historial de cambios auditable

**Derecho al Olvido (Art. 17):**

- Botón "Eliminar mi cuenta" en settings
- Proceso de 30 días con confirmación
- Eliminación completa de:
  - Datos personales
  - Tareas y proyectos
  - Historial de actividad
  - Backups (dentro de 90 días)
- Email de confirmación de eliminación
- Retención mínima por requisitos legales documentada

**Derecho a la Portabilidad (Art. 20):**

- Exportación completa en formatos:
  - JSON (datos estructurados)
  - CSV (tareas y proyectos)
  - PDF (reportes y métricas)
- Incluye: tareas, proyectos, comentarios, archivos adjuntos
- Generación bajo demanda (<24h para cuentas grandes)

**Consentimiento (Art. 7):**

- Consentimiento explícito para:
  - Cookies no esenciales
  - Comunicaciones de marketing
  - Procesamiento de IA
- Retiro de consentimiento fácil
- Registro de consentimientos con timestamp

**Notificación de Brechas (Art. 33-34):**

- Proceso documentado de respuesta
- Notificación a autoridades <72h
- Notificación a usuarios afectados

**CCPA - California Consumer Privacy Act:**

- "Do Not Sell My Personal Information" link
- Categorías de datos recolectados documentadas
- Propósitos de uso claros
- Proceso de opt-out para residentes de California

**Implementación Técnica:**

- Privacy Center integrado en app
- APIs de exportación/eliminación
- Logs inmutables de acceso a datos
- Encriptación de datos sensibles en reposo
- Pseudonimización donde sea posible

### 9.5 Performance

- SSR + ISR para SEO y velocidad
- Optimistic updates
- Virtual scrolling para listas grandes
- Image optimization automática
- Code splitting agresivo
- < 3s FCP, < 5s TTI

---

## 10. Modelo de Negocio

### 10.1 Tiers de Pricing

**Free (Personal)**

- 1 workspace personal
- 50 tareas activas
- Funciones básicas de IA (limitadas)
- 100 MB storage
- Sincronización entre 2 dispositivos

**Pro ($9/mes)**

- Workspaces ilimitados
- Tareas ilimitadas
- IA completa sin límites
- 10 GB storage
- Dispositivos ilimitados
- Integraciones avanzadas
- Temas custom
- Prioridad en soporte

**Team ($12/usuario/mes)**

- Todo de Pro +
- Workspaces compartidos
- Colaboración en tiempo real
- Roles y permisos
- Analytics de equipo
- SSO (SAML)
- Onboarding dedicado

**Enterprise (Custom)**

- Todo de Team +
- Self-hosted option
- SLA garantizado
- Soporte 24/7
- Custom integrations
- Auditoría avanzada
- Data residency

### 10.2 Estrategia Go-to-Market

**Fase 1: Beta Privada (3 meses)**

- 1000 early adopters
- Feedback intensivo
- Refinamiento de IA

**Fase 2: Beta Pública (3 meses)**

- Free tier abierto
- Product Hunt launch
- Influencer partnerships

**Fase 3: General Availability**

- Lanzamiento de planes pagos
- Marketing digital agresivo
- Partnership con empresas

---

## 11. Roadmap de Desarrollo

### MVP (Meses 1-4)

**Must-have:**

- ✅ Gestión básica de tareas (CRUD)
- ✅ Vista Lista y Calendario
- ✅ Workspaces (Personal/Trabajo)
- ✅ Timer Pomodoro/Tiempo Corrido
- ✅ Dashboard básico de métricas
- ✅ Web app responsive (PWA)
- ✅ Autenticación y sync
- ✅ NLP básico para creación de tareas
- ✅ Onboarding interactivo
- ✅ Empty states y error handling

**Nota:** Vista Timeline (Gantt) y Energy Matching movidos a versiones posteriores para mantener MVP enfocado.

### V1.0 (Meses 5-6)

- ✅ Mobile apps (iOS/Android) via React Native
- ✅ Vista Kanban
- ✅ Equipos y colaboración básica
- ✅ Integraciones con Calendar
- ✅ IA: Smart scheduling y priorización
- ✅ Templates básicos
- ✅ Modo offline
- ✅ i18n: Español, Portugués

### V1.5 (Meses 7-9)

- ✅ Desktop apps (Electron) - Evaluar si PWA es suficiente primero
- ✅ Vista Timeline (Gantt ligero)
- ✅ IA: Detección de patrones
- ✅ Integrations hub (Gmail, Slack)
- ✅ Analytics avanzados
- ✅ Weekly review asistida
- ✅ Focus Shield
- ✅ i18n: Francés, Alemán, Italiano

### V2.0 (Meses 10-12)

- ✅ Energy matching
- ✅ Automatizaciones custom
- ✅ API pública
- ✅ Marketplace de templates
- ✅ Widgets para iOS/Android
- ✅ Voice assistant (Siri/Google)
- ✅ Gamificación y achievements
- ✅ i18n: Japonés, Coreano, Chino, Árabe

---

## 12. Métricas de Éxito (KPIs)

### Producto

- **DAU/MAU ratio**: > 40% (stickiness)
- **Retention D7**: > 60%
- **Retention D30**: > 40%
- **Tasa de activación**: > 70% (completan onboarding)
- **Time to first task**: < 2 minutos

### Negocio

- **Free-to-paid conversion**: > 5%
- **Churn mensual**: < 3%
- **NPS**: > 50
- **CAC Payback**: < 12 meses
- **ARR crecimiento**: 15% MoM

### Engagement

- **Tareas creadas/usuario/día**: > 5
- **Tareas completadas/usuario/día**: > 3
- **Sesiones/usuario/día**: > 2
- **Tiempo en app/día**: > 15 minutos
- **Uso de IA**: > 30% de usuarios/semana

---

## 13. Diferenciadores Competitivos

### vs Todoist

✅ IA más potente y proactiva
✅ Timer integrado nativamente
✅ Energy matching
✅ UI más moderna

### vs Notion

✅ Enfocado en tareas (no all-in-one)
✅ Más rápido y liviano
✅ IA específica para productividad
✅ Mobile experience superior

### vs ClickUp

✅ No abrumador, curva de aprendizaje suave
✅ Diseño más limpio
✅ IA más accesible
✅ Mejor para individuos y equipos pequeños

### vs Asana

✅ Precio más accesible
✅ IA incluida en todos los planes
✅ Mejor para balance vida-trabajo
✅ Timer y focus features

---

## 14. Riesgos y Mitigaciones

| Riesgo                         | Probabilidad | Impacto | Mitigación                                     |
| ------------------------------ | ------------ | ------- | ---------------------------------------------- |
| IA costosa limita rentabilidad | Media        | Alto    | Caché agresivo, fine-tuning de modelos propios |
| Mercado saturado               | Alta         | Medio   | Diferenciación clara, nicho específico         |
| Problemas de sync              | Media        | Alto    | Testing exhaustivo, rollback rápido            |
| Adopción lenta                 | Media        | Alto    | Freemium generoso, viral loops                 |
| Competidor copia features      | Alta         | Medio   | Innovación continua, marca fuerte              |

---

## 15. Preguntas Abiertas / Decisiones Pendientes

1. **¿Self-hosted desde MVP o solo cloud?**

   - Recomendación: Solo cloud en MVP, self-hosted en Enterprise

2. **¿Gamificación explícita o sutil?**

   - Recomendación: Sutil en default, activable en settings

3. **¿API pública desde V1?**

   - Recomendación: Beta privada en V1.5, pública en V2.0

4. **¿White-label para enterprise?**

   - Recomendación: Evaluar en V2.0 si hay demanda

5. **¿Marketplace de integraciones de terceros?**
   - Recomendación: Post V2.0, requiere ecosistema maduro

---

## 16. Conclusión

Ordo-Todo tiene potencial de convertirse en la herramienta de productividad de referencia para la próxima década combinando:

1. **Simplicidad** que respeta el tiempo del usuario
2. **Inteligencia** que ayuda sin molestar
3. **Flexibilidad** que se adapta a cualquier workflow
4. **Belleza** que hace placentero el trabajo diario

El éxito dependerá de:

- Ejecución impecable del MVP
- Feedback loop continuo con usuarios
- Balance entre features y simplicidad
- Innovación constante en IA
- Construcción de comunidad fuerte

**Siguiente paso:** Validar con usuarios potenciales mediante prototipos interactivos y ajustar basado en feedback antes de desarrollo completo.

---

**Documento vivo**: Este PRD debe actualizarse trimestralmente basado en learnings del mercado, feedback de usuarios y evolución tecnológica.

**Versión**: 1.0  
**Última actualización**: Noviembre 2025  
**Owner**: Equipo Ordo-Todo  
**Status**: Aprobado para MVP
