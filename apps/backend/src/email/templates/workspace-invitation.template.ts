import {
  EmailTemplate,
  EmailTemplateData,
} from '../interfaces/email-template.interface';

export const workspaceInvitationTemplate = (
  data: EmailTemplateData & {
    workspace: {
      name: string;
      description?: string;
      color?: string;
    };
    inviter: {
      name: string;
    };
    invitationToken: string;
  },
): EmailTemplate => {
  const { user, workspace, inviter, invitationToken } = data;

  return {
    subject: `🔗 Invitación para unirte a ${workspace.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitación de Workspace</title>
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
            border-top: 4px solid ${workspace.color || '#8b5cf6'};
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .workspace-icon {
            width: 60px;
            height: 60px;
            border-radius: 12px;
            background-color: ${workspace.color || '#8b5cf6'};
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            margin: 0 auto 20px;
          }
          .invitation-box {
            background-color: #f1f5f9;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
            text-align: center;
            border: 2px dashed ${workspace.color || '#8b5cf6'}40;
          }
          .invitation-code {
            background-color: ${workspace.color || '#8b5cf6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 16px;
            font-weight: bold;
            letter-spacing: 1px;
            margin: 15px 0;
            display: inline-block;
          }
          .cta-button {
            display: inline-block;
            background-color: ${workspace.color || '#8b5cf6'};
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            font-size: 16px;
          }
          .cta-button:hover {
            opacity: 0.9;
          }
          .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 15px;
            margin: 30px 0;
          }
          .feature {
            text-align: center;
            padding: 15px 10px;
          }
          .feature-icon {
            font-size: 28px;
            margin-bottom: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
          }
          .inviter-message {
            background-color: #fef3c7;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="workspace-icon">
              ${workspace.name.charAt(0).toUpperCase()}
            </div>
            <h1 style="margin: 0; color: #1e293b;">Invitación para colaborar</h1>
            <p style="margin: 10px 0 0 0; color: #64748b; font-size: 16px;">
              ${inviter.name} te ha invitado a unirte al workspace
            </p>
            <h2 style="margin: 5px 0; color: #1e293b;">
              <strong>${workspace.name}</strong>
            </h2>
          </div>

          ${
            workspace.description
              ? `
            <p style="text-align: center; margin: 20px 0; color: #64748b; font-size: 16px;">
              ${workspace.description}
            </p>
          `
              : ''
          }

          <div class="inviter-message">
            <p style="margin: 0;">
              💬 <strong>Mensaje de ${inviter.name}:</strong><br>
              "Me encantaría que te unas a nuestro workspace para colaborar en proyectos juntos."
            </p>
          </div>

          <div class="invitation-box">
            <h3 style="margin-top: 0; color: #1e293b;">🎉 ¡Acepta la invitación!</h3>
            <p style="color: #64748b;">
              Únete para compartir tareas, proyectos y alcanzar metas juntos
            </p>
            <div class="invitation-code">
              ${invitationToken}
            </div>
            <p style="font-size: 14px; color: #94a3b8; margin-top: 10px;">
              Código de invitación
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/invitations/accept/${invitationToken}" class="cta-button">
              Aceptar Invitación →
            </a>
            <p style="margin-top: 10px; color: #64748b; font-size: 14px;">
              o copia este código: <code>${invitationToken}</code>
            </p>
          </div>

          <div class="features">
            <div class="feature">
              <div class="feature-icon">📋</div>
              <h4>Tareas</h4>
              <p style="font-size: 14px; margin: 5px 0; color: #64748b;">Comparte y asigna</p>
            </div>
            <div class="feature">
              <div class="feature-icon">📁</div>
              <h4>Proyectos</h4>
              <p style="font-size: 14px; margin: 5px 0; color: #64748b;">Organiza en equipo</p>
            </div>
            <div class="feature">
              <div class="feature-icon">⏰</div>
              <h4>Timer</h4>
              <p style="font-size: 14px; margin: 5px 0; color: #64748b;">Pomodoro compartido</p>
            </div>
            <div class="feature">
              <div class="feature-icon">📊</div>
              <h4>Analytics</h4>
              <p style="font-size: 14px; margin: 5px 0; color: #64748b;">Progreso grupal</p>
            </div>
          </div>

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
            <h4 style="color: #0c4a6e; margin-top: 0;">✨ ¿Qué sucede después de aceptar?</h4>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>Podrás ver todas las tareas y proyectos del workspace</li>
              <li>Recibirás notificaciones de nuevas asignaciones</li>
              <li>Podrás colaborar en tiempo real con el equipo</li>
              <li>Tendrás acceso al analytics del workspace</li>
            </ul>
          </div>

          <div class="footer">
            <p style="margin: 5px 0;">
              ¿Preguntas? Responde a este email o contacta a ${inviter.name}
            </p>
            <p style="margin: 20px 0 5px 0;">Ordo-Todo - Trabaja mejor en equipo</p>
            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
              Esta invitación expirará en 7 días.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      🔗 Invitación para unirte a ${workspace.name}

      ¡Hola ${user.name}!

      ${inviter.name} te ha invitado a unirte al workspace "${workspace.name}" para colaborar en proyectos juntos.

      ${workspace.description ? `\nSobre el workspace: ${workspace.description}` : ''}

      🎉 ¡Acepta la invitación!
      Únete para compartir tareas, proyectos y alcanzar metas juntos

      Código de invitación: ${invitationToken}
      Link: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/invitations/accept/${invitationToken}

      ✨ ¿Qué sucede después de aceptar?
      - Podrás ver todas las tareas y proyectos del workspace
      - Recibirás notificaciones de nuevas asignaciones
      - Podrás colaborar en tiempo real con el equipo
      - Tendrás acceso al analytics del workspace

      ¿Preguntas? Responde a este email o contacta a ${inviter.name}

      Ordo-Todo - Trabaja mejor en equipo

      Esta invitación expirará en 7 días.
    `,
  };
};
