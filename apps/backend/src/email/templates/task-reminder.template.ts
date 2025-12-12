import {
  EmailTemplate,
  EmailTemplateData,
} from '../interfaces/email-template.interface';

export const taskReminderTemplate = (
  data: EmailTemplateData & {
    task: {
      title: string;
      description?: string;
      dueDate?: Date;
      priority: string;
      project?: string;
    };
  },
): EmailTemplate => {
  const { user, task } = data;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const dueDateText = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const priorityColors = {
    LOW: '#10b981',
    MEDIUM: '#f59e0b',
    HIGH: '#f97316',
    URGENT: '#ef4444',
  };

  return {
    subject: isOverdue
      ? `⚠️ Tarea vencida: ${task.title}`
      : `📋 Recordatorio: ${task.title}`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recordatorio de Tarea</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background-color: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-top: 4px solid ${isOverdue ? '#ef4444' : '#8b5cf6'};
          }
          .header {
            display: flex;
            align-items: center;
            margin-bottom: 25px;
          }
          .icon {
            font-size: 28px;
            margin-right: 15px;
          }
          .priority {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            color: white;
            margin-left: 10px;
          }
          .task-details {
            background-color: #f1f5f9;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .task-title {
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 10px 0;
            color: #1e293b;
          }
          .task-description {
            margin: 10px 0;
            color: #64748b;
          }
          .task-meta {
            display: flex;
            gap: 20px;
            margin-top: 15px;
            font-size: 14px;
            color: #64748b;
          }
          .meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .cta-button {
            display: inline-block;
            background-color: #8b5cf6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          .overdue-warning {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #991b1b;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">${isOverdue ? '⚠️' : '📋'}</div>
            <div>
              <h1 style="margin: 0; color: #1e293b;">
                Recordatorio de Tarea
                <span class="priority" style="background-color: ${priorityColors[task.priority as keyof typeof priorityColors]}">
                  ${task.priority}
                </span>
              </h1>
              <p style="margin: 5px 0 0 0; color: #64748b; font-size: 16px;">
                ${isOverdue ? 'Esta tarea está vencida' : 'Tienes una tarea pendiente'}
              </p>
            </div>
          </div>

          ${
            isOverdue
              ? `
            <div class="overdue-warning">
              <h3 style="margin-top: 0;">⏰ Esta tarea está vencida</h3>
              <p style="margin-bottom: 0;">
                La fecha límite fue el ${dueDateText}. Es importante completar esta tarea lo antes posible.
              </p>
            </div>
          `
              : ''
          }

          <div class="task-details">
            <h2 class="task-title">${task.title}</h2>
            ${task.description ? `<p class="task-description">${task.description}</p>` : ''}

            <div class="task-meta">
              ${
                task.project
                  ? `
                <div class="meta-item">
                  📁 ${task.project}
                </div>
              `
                  : ''
              }
              ${
                task.dueDate
                  ? `
                <div class="meta-item">
                  📅 ${isOverdue ? 'Vencía el' : 'Vence el'} ${dueDateText}
                </div>
              `
                  : ''
              }
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks" class="cta-button">
              Ver Tarea →
            </a>
          </div>

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
            <h4 style="color: #0c4a6e; margin-top: 0;">💡 Tips para completar tu tarea:</h4>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>Usa la técnica Pomodoro: 25 minutos de enfoque, 5 de descanso</li>
              <li>Divide la tarea en partes más pequeñas si es muy grande</li>
              <li>Elimina distracciones y enfócate solo en esta tarea</li>
            </ul>
          </div>

          <div class="footer">
            <p style="margin: 5px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings/notifications" style="color: #8b5cf6; text-decoration: none;">
                Configurar notificaciones →
              </a>
            </p>
            <p style="margin: 20px 0 5px 0;">Ordo-Todo - Tu compañero de productividad</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      ${isOverdue ? '⚠️ TAREA VENCIDA:' : '📋 RECORDATORIO DE TAREA:'}

      ${task.title}
      ${task.priority ? `Prioridad: ${task.priority}` : ''}
      ${task.project ? `Proyecto: ${task.project}` : ''}
      ${task.dueDate ? `${isOverdue ? 'Vencía el' : 'Vence el'} ${dueDateText}` : ''}

      ${task.description ? `\nDescripción:\n${task.description}` : ''}

      ${isOverdue ? '\nEsta tarea está vencida. Es importante completarla lo antes posible.' : ''}

      💡 Tips para completar tu tarea:
      - Usa la técnica Pomodoro: 25 minutos de enfoque, 5 de descanso
      - Divide la tarea en partes más pequeñas si es muy grande
      - Elimina distracciones y enfócate solo en esta tarea

      Ver tarea: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks

      Ordo-Todo - Tu compañero de productividad
    `,
  };
};
