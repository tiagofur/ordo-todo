import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { WinstonModule } from 'nest-winston';
import helmet from 'helmet';
import compression from 'compression';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { loggerConfig } from './common/logger/logger.config';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import {
  CorrelationIdMiddleware,
  correlationIdMiddleware,
} from './common/middleware/correlation-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(loggerConfig),
  });

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow resource sharing for uploads
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for styled-components
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'no-referrer' },
      permittedCrossDomainPolicies: false,
      hidePoweredBy: true,
      ieNoOpen: true,
      frameguard: { action: 'deny' },
    }),
  );

  // Compression middleware (compress responses > 1KB)
  app.use(
    compression({
      threshold: 1024, // 1KB
    }),
  );

  // Apply correlation ID middleware (must be before all other middleware)
  app.use(correlationIdMiddleware);

  // Apply logging interceptor globally
  app.useGlobalInterceptors(new LoggingInterceptor());

  const configService = app.get(ConfigService);
  const httpAdapter = app.get(HttpAdapterHost);

  // Serve static files from uploads directory
  // Use process.cwd() to get project root, works in both dev and prod
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // CORS
  const corsOrigins = configService.get<string>('CORS_ORIGINS')!.split(',');
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global prefix
  app.setGlobalPrefix(configService.get<string>('API_PREFIX')!);

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Ordo-Todo API')
    .setDescription(
      `# Ordo-Todo REST API

## Overview
Ordo-Todo is a comprehensive task management platform with AI-powered productivity features.

## Authentication
Most endpoints require a valid JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Response Format
All responses follow this structure:
\`\`\`json
{
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/resource",
  "message": "Success"
}
\`\`\`

## Error Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict
- **500** - Internal Server Error

## Rate Limiting
API endpoints are rate-limited. Exceeding limits will result in 429 errors.`,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication and user management')
    .addTag('Users', 'User profile and preferences')
    .addTag('Workspaces', 'Workspace management')
    .addTag('Workflows', 'Workflow and project phases')
    .addTag('Projects', 'Project management')
    .addTag('Tasks', 'Task CRUD and management')
    .addTag('Tags', 'Task tagging system')
    .addTag('Timers', 'Pomodoro timer and time tracking')
    .addTag('Analytics', 'Productivity analytics and reports')
    .addTag('AI', 'AI-powered features (chat, parsing, suggestions)')
    .addTag('Attachments', 'File uploads and management')
    .addTag('Comments', 'Task comments and discussions')
    .addTag('Notifications', 'User notifications')
    .addTag('Integrations', 'Third-party integrations')
    .addTag('Meetings', 'Meeting assistant and notes')
    .addTag('Gamification', 'Achievements and points')
    .addTag('Search', 'Semantic search')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
    },
    customSiteTitle: 'Ordo-Todo API Docs',
  });

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapter));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = configService.get<number>('PORT', 3101);
  await app.listen(port);

  const apiPrefix = configService.get<string>('API_PREFIX')!;
  console.log(`Application running on: http://localhost:${port}`);
  console.log(`API available at: http://localhost:${port}/${apiPrefix}`);
  console.log(`API documentation at: http://localhost:${port}/api-docs`);
}
bootstrap();
// Build: 2025-12-16 - rxjs dependency fix
