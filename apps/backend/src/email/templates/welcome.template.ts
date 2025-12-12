import { EmailTemplate, EmailTemplateData } from '../interfaces/email-template.interface';

export const welcomeTemplate = (data: EmailTemplateData): EmailTemplate => {
  const { user } = data;

  return {
    subject: '¡Bienvenido a Ordo-Todo! 🚀',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido a Ordo-Todo</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #8b5cf6;
            margin: 0;
          }
          .highlight {
            background-color: #fef3c7;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
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
          .cta-button:hover {
            background-color: #7c3aed;
          }
          .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin: 30px 0;
          }
          .feature {
            text-align: center;
            padding: 15px;
          }
          .feature-icon {
            font-size: 24px;
            margin-bottom: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">✅ Ordo-Todo</h1>
            <h2 style="color: #333; margin: 10px 0;">¡Bienvenido a bordor, ${user.name}!</h2>
          </div>

          <p style="font-size: 18px;">
            Estamos emocionados de tenerte con nosotros. Ordo-Todo está diseñado para ayudarte a
            <strong>organizar tus tareas</strong>, <strong>mejorar tu productividad</strong> y
            <strong>alcanzar tus metas</strong>.
          </p>

          <div class="highlight">
            <h3 style="margin-top: 0;">🎯 Consejo rápido:</h3>
            <p style="margin-bottom: 0;">Empienza creando tu primera tarea. ¡La clave está en dividir grandes proyectos en tareas pequeñas y manejables!</p>
          </div>

          <div class="features">
            <div class="feature">
              <div class="feature-icon">⏰</div>
              <h4>Timer Pomodoro</h4>
              <p style="font-size: 14px; margin: 5px 0;">Técnica de enfoque probada</p>
            </div>
            <div class="feature">
              <div class="feature-icon">📊</div>
              <h4>Analytics</h4>
              <p style="font-size: 14px; margin: 5px 0;">Mide tu progreso</p>
            </div>
            <div class="feature">
              <div class="feature-icon">🤖</div>
              <h4>AI Assistant</h4>
              <p style="font-size: 14px; margin: 5px 0;">Planificación inteligente</p>
            </div>
            <div class="feature">
              <div class="feature-icon">👥</div>
              <h4>Colaboración</h4>
              <p style="font-size: 14px; margin: 5px 0;">Trabaja en equipo</p>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="cta-button">
              Comenzar a usar Ordo-Todo →
            </a>
          </div>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #475569; margin-top: 0;">📱 Disponible en todas partes</h4>
            <p style="margin-bottom: 15px;">Usa Ordo-Todo en tu dispositivo preferido:</p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>💻 Aplicación Web</li>
              <li>📱 App Móvil (iOS/Android)</li>
              <li>🖥️ App Desktop (Windows/Mac/Linux)</li>
            </ul>
          </div>

          <div class="footer">
            <p style="margin: 5px 0;">¿Necesitas ayuda? Responde a este email y nuestro equipo te asistirá.</p>
            <p style="margin: 5px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/help" style="color: #8b5cf6; text-decoration: none;">
                Centro de Ayuda →
              </a>
            </p>
            <p style="margin: 20px 0 5px 0; color: #999;">Ordo-Todo - Tu compañero de productividad</p>
            <p style="margin: 0; color: #999; font-size: 12px;">
              Si no creaste esta cuenta, puedes ignorar este email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      ¡Bienvenido a Ordo-Todo, ${user.name}! 🚀

      Estamos emocionados de tenerte con nosotros. Ordo-Todo está diseñado para ayudarte a organizar tus tareas, mejorar tu productividad y alcanzar tus metas.

      🎯 Consejo rápido: Empienza creando tu primera tarea. ¡La clave está en dividir grandes proyectos en tareas pequeñas y manejables!

      Características principales:
      ⏰ Timer Pomodoro - Técnica de enfoque probada
      📊 Analytics - Mide tu progreso
      🤖 AI Assistant - Planificación inteligente
      👥 Colaboración - Trabaja en equipo

      Comienza ahora: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard

      ¿Necesitas ayuda? Responde a este email y nuestro equipo te asistirá.

      Ordo-Todo - Tu compañero de productividad
    `,
  };
};