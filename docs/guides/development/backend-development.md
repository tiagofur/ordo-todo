# Backend Development Guide

**Building the NestJS REST API for ORDO**

## 📋 Table of Contents

1. [Project Structure](#project-structure)
2. [Controllers](#controllers)
3. [Services](#services)
4. [Repositories](#repositories)
5. [DTOs & Validation](#dtos--validation)
6. [Authentication & Authorization](#authentication--authorization)
7. [Error Handling](#error-handling)
8. [Testing](#testing)
9. [API Documentation](#api-documentation)

---

## 📁 Project Structure

```
apps/backend/src/
├── [domain]/                  # Feature-based organization
│   ├── controllers/          # HTTP endpoints
│   │   └── [domain].controller.ts
│   ├── services/             # Business logic
│   │   └── [domain].service.ts
│   ├── dto/                  # Data Transfer Objects
│   │   ├── create-[domain].dto.ts
│   │   ├── update-[domain].dto.ts
│   │   └── query-[domain].dto.ts
│   └── [domain].module.ts    # Module definition
│
├── common/                   # Shared backend code
│   ├── decorators/           # Custom decorators
│   │   └── current-user.decorator.ts
│   ├── filters/             # Exception filters
│   │   └── http-exception.filter.ts
│   ├── guards/              # Auth guards
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/        # Interceptors
│   │   └── logging.interceptor.ts
│   ├── pipes/               # Custom pipes
│   └── interfaces/          # Shared interfaces
│       ├── paginated-result.interface.ts
│       └── request-user.interface.ts
│
├── config/                  # Configuration
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── openai.config.ts
│
├── repositories/            # Prisma repositories
│   ├── idea.repository.ts
│   ├── content-piece.repository.ts
│   └── user.repository.ts
│
├── app.module.ts           # Root module
├── main.ts                 # Application entry point
└── prisma.service.ts       # Prisma service
```

---

## 🎮 Controllers

Controllers handle HTTP requests/responses. They delegate to services.

### Basic Controller

```typescript
// ideas/ideas.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { RequestUser } from "../common/interfaces/request-user.interface";
import { IdeasService } from "./ideas.service";
import { CreateIdeaDto } from "./dto/create-idea.dto";
import { Idea } from "@ordo-todo/core";

@Controller("ideas")
@UseGuards(JwtAuthGuard)
@ApiTags("ideas")
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Post()
  @ApiOperation({ summary: "Create a new idea" })
  @ApiResponse({ status: 201, type: Idea })
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateIdeaDto,
  ): Promise<Idea> {
    return this.ideasService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all ideas" })
  @ApiResponse({ status: 200, type: [Idea] })
  findAll(@CurrentUser() user: RequestUser): Promise<Idea[]> {
    return this.ideasService.findAll(user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get idea by ID" })
  @ApiResponse({ status: 200, type: Idea })
  findOne(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
  ): Promise<Idea> {
    return this.ideasService.findOne(id, user.id);
  }
}
```

### Public Endpoints

```typescript
// auth/auth.controller.ts
import { Public } from "../common/decorators/public.decorator";

@Controller("auth")
export class AuthController {
  @Public() // No auth required
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("register") // Auth required (default)
  @UseGuards(JwtAuthGuard)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
```

### RESTful Routes

```typescript
// ✅ CORRECT: RESTful
@Controller('content-pieces')
export class ContentPiecesController {
  @Get()                    // GET /content-pieces
  findAll() {}

  @Get(':id')               // GET /content-pieces/:id
  findOne(@Param('id') id: string) {}

  @Post()                   // POST /content-pieces
  create(@Body() dto: CreateContentPieceDto) {}

  @Patch(':id')             // PATCH /content-pieces/:id
  update(@Param('id') id: string, @Body() dto: UpdateContentPieceDto) {}

  @Delete(':id')            // DELETE /content-pieces/:id
  delete(@Param('id') id: string) {}
}

// ❌ WRONG: Non-RESTful
@Get('get-all-content-pieces')
getAllContentPieces() {}

@Get('get-content-piece-by-id/:id')
getContentPieceById(@Param('id') id: string) {}

@Post('create-content-piece')
createContentPiece() {}
```

---

## 🔧 Services

Services contain business logic and orchestrate domain use cases.

### Basic Service

```typescript
// ideas/ideas.service.ts
import { Injectable } from "@nestjs/common";
import {
  CreateIdeaUseCase,
  MoveIdeaToContentUseCase,
  ArchiveIdeaUseCase,
} from "@ordo-todo/core";
import { PrismaIdeaRepository } from "../repositories/idea.repository";
import { CreateIdeaDto, UpdateIdeaDto } from "./dto";
import { Idea } from "@ordo-todo/core";

@Injectable()
export class IdeasService {
  private readonly createIdeaUseCase: CreateIdeaUseCase;
  private readonly moveIdeaToContentUseCase: MoveIdeaToContentUseCase;
  private readonly archiveIdeaUseCase: ArchiveIdeaUseCase;

  constructor(private readonly ideaRepo: PrismaIdeaRepository) {
    // Initialize use cases with repositories
    this.createIdeaUseCase = new CreateIdeaUseCase(this.ideaRepo);
    this.moveIdeaToContentUseCase = new MoveIdeaToContentUseCase(this.ideaRepo);
    this.archiveIdeaUseCase = new ArchiveIdeaUseCase(this.ideaRepo);
  }

  async create(dto: CreateIdeaDto, userId: string): Promise<Idea> {
    // Use domain use case
    return await this.createIdeaUseCase.execute({
      title: dto.title,
      description: dto.description,
      userId,
    });
  }

  async findAll(userId: string): Promise<Idea[]> {
    return await this.ideaRepo.findAll(userId);
  }

  async findOne(id: string, userId: string): Promise<Idea> {
    const idea = await this.ideaRepo.findById(id);

    if (!idea) {
      throw new NotFoundException("Idea not found");
    }

    if (idea.userId !== userId) {
      throw new ForbiddenException("You do not own this idea");
    }

    return idea;
  }

  async moveToContent(id: string, userId: string): Promise<ContentPiece> {
    // Domain validation via use case
    return await this.moveIdeaToContentUseCase.execute(id, userId);
  }

  async archive(id: string, userId: string): Promise<Idea> {
    return await this.archiveIdeaUseCase.execute(id, userId);
  }
}
```

### Service Rules

1. **NO HTTP concerns**: Don't use Response, Request, etc.
2. **Use domain entities**: Import from `@ordo-todo/core`
3. **Use use cases**: Orchestrate business logic
4. **Throw exceptions**: Use NestJS exceptions

```typescript
// ✅ CORRECT
@Injectable()
export class IdeasService {
  async create(dto: CreateIdeaDto, userId: string): Promise<Idea> {
    const idea = new Idea({ title: dto.title, userId });
    return await this.ideaRepo.save(idea);
  }
}

// ❌ WRONG: HTTP concerns in service
@Injectable()
export class IdeasService {
  async create(@Res() res: Response, dto: CreateIdeaDto) {
    const idea = await this.prisma.idea.create({ data: dto });
    return res.status(201).json(idea); // ❌ HTTP logic in service
  }
}
```

---

## 🗃️ Repositories

Repositories abstract data access using Prisma.

### Repository Implementation

```typescript
// repositories/idea.repository.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { IdeaRepository, Idea, IdeaStatus } from "@ordo-todo/core";

@Injectable()
export class PrismaIdeaRepository implements IdeaRepository {
  constructor(private prisma: PrismaService) {}

  async save(idea: Idea): Promise<Idea> {
    const saved = await this.prisma.idea.upsert({
      where: { id: idea.id },
      create: {
        id: idea.id,
        title: idea.title,
        description: idea.description,
        status: idea.status,
        userId: idea.userId,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt,
      },
      update: {
        title: idea.title,
        description: idea.description,
        status: idea.status,
        updatedAt: new Date(),
      },
    });

    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Idea | null> {
    const found = await this.prisma.idea.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findAll(userId: string): Promise<Idea[]> {
    const ideas = await this.prisma.idea.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return ideas.map((idea) => this.toDomain(idea));
  }

  async findByStatus(userId: string, status: IdeaStatus): Promise<Idea[]> {
    const ideas = await this.prisma.idea.findMany({
      where: { userId, status },
      orderBy: { createdAt: "desc" },
    });

    return ideas.map((idea) => this.toDomain(idea));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.idea.delete({ where: { id } });
  }

  private toDomain(prismaIdea: any): Idea {
    return new Idea({
      id: prismaIdea.id,
      title: prismaIdea.title,
      description: prismaIdea.description,
      status: prismaIdea.status,
      userId: prismaIdea.userId,
      createdAt: prismaIdea.createdAt,
      updatedAt: prismaIdea.updatedAt,
    });
  }
}
```

---

## 📦 DTOs & Validation

DTOs validate and transform input data using class-validator.

### Create DTO

```typescript
// ideas/dto/create-idea.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateIdeaDto {
  @ApiProperty({ example: "New content idea", description: "Idea title" })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: "Title must be at least 3 characters" })
  @MaxLength(100, { message: "Title must be less than 100 characters" })
  title: string;

  @ApiPropertyOptional({
    example: "Detailed description...",
    description: "Idea description",
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: "Description must be less than 1000 characters" })
  description?: string;
}
```

### Update DTO

```typescript
// ideas/dto/update-idea.dto.ts
import { PartialType, OmitType } from "@nestjs/swagger";
import { CreateIdeaDto } from "./create-idea.dto";

export class UpdateIdeaDto extends PartialType(CreateIdeaDto) {}
```

### Query DTO

```typescript
// ideas/dto/query-ideas.dto.ts
import { Type } from "class-transformer";
import { IsOptional, IsInt, Min, Max, IsEnum } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IdeaStatus } from "@ordo-todo/core";

export class QueryIdeasDto {
  @ApiPropertyOptional({ default: 1, description: "Page number" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, description: "Items per page" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: IdeaStatus, description: "Filter by status" })
  @IsOptional()
  @IsEnum(IdeaStatus)
  status?: IdeaStatus;
}
```

### Global Validation Pipe

```typescript
// main.ts
import { ValidationPipe } from "@nestjs/common";

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip non-whitelisted properties
    forbidNonWhitelisted: true, // Throw error if non-whitelisted
    transform: true, // Transform types automatically
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

---

## 🔐 Authentication & Authorization

### JWT Guard

```typescript
// common/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

### Current User Decorator

```typescript
// common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface RequestUser {
  id: string;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### Usage in Controller

```typescript
@Controller("ideas")
@UseGuards(JwtAuthGuard)
export class IdeasController {
  @Get()
  findAll(@CurrentUser() user: RequestUser) {
    // user.id, user.email available
    return this.ideasService.findAll(user.id);
  }
}
```

---

## ⚠️ Error Handling

### Built-in Exceptions

```typescript
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";

// ✅ CORRECT: Use built-in exceptions
throw new BadRequestException("Title is required");
throw new UnauthorizedException("Invalid credentials");
throw new NotFoundException("Idea not found");
throw new ForbiddenException("You do not own this idea");
throw new ConflictException("Email already exists");

// ❌ WRONG: Generic errors
throw new Error("Something went wrong");
```

### Exception Filter

```typescript
// common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const error = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
      message:
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : (exceptionResponse as any).message,
    };

    response.status(status).json(error);
  }
}
```

### Use Globally

```typescript
// main.ts
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

app.useGlobalFilters(new HttpExceptionFilter());
```

---

## 🧪 Testing

### Controller Unit Tests

```typescript
// ideas/ideas.controller.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { IdeasController } from "./ideas.controller";
import { IdeasService } from "./ideas.service";

describe("IdeasController", () => {
  let controller: IdeasController;
  let service: IdeasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdeasController],
      providers: [
        {
          provide: IdeasService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<IdeasController>(IdeasController);
    service = module.get<IdeasService>(IdeasService);
  });

  describe("create", () => {
    it("should create an idea", async () => {
      const dto: CreateIdeaDto = { title: "Test Idea" };
      const result = { id: "1", ...dto };

      jest.spyOn(service, "create").mockResolvedValue(result as any);

      expect(await controller.create({ id: "user-1" } as any, dto)).toEqual(
        result,
      );
      expect(service.create).toHaveBeenCalledWith(dto, "user-1");
    });
  });
});
```

### E2E Tests

```typescript
// ideas/ideas.e2e-spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../app.module";

describe("Ideas (e2e)", () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Setup test user and get auth token
    authToken = await setupTestUser(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /ideas", () => {
    it("should create an idea", () => {
      return request(app.getHttpServer())
        .post("/ideas")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "E2E Test Idea" })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("id");
          expect(res.body.title).toBe("E2E Test Idea");
        });
    });
  });
});
```

---

## 📚 API Documentation

### Swagger Setup

```typescript
// main.ts
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const config = new DocumentBuilder()
  .setTitle("ORDO API")
  .setDescription("The Creator's OS API")
  .setVersion("1.0")
  .addBearerAuth()
  .addTag("ideas")
  .addTag("content-pieces")
  .addTag("series")
  .addTag("auth")
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup("api-docs", app, document);
```

### Documenting Endpoints

```typescript
@Controller("ideas")
@ApiTags("ideas")
export class IdeasController {
  @Post()
  @ApiOperation({ summary: "Create a new idea" })
  @ApiResponse({ status: 201, description: "Idea created", type: Idea })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateIdeaDto,
  ): Promise<Idea> {
    return this.ideasService.create(dto, user.id);
  }
}
```

---

## 🎯 Best Practices

### ✅ DO

1. **Feature-based organization**: Group by domain, not layer
2. **Use domain entities**: Import from `@ordo-todo/core`
3. **Validate with DTOs**: Use class-validator
4. **Document with Swagger**: All endpoints need docs
5. **Test everything**: Unit tests + E2E tests
6. **Check authorization**: Verify user owns resource

### ❌ DON'T

1. **Put business logic in controllers**: Delegate to services
2. **Use HTTP in services**: Services should be platform-agnostic
3. **Skip validation**: Always validate input
4. **Ignore errors**: Handle exceptions properly
5. **Hardcode values**: Use constants or env vars

---

## 📚 Further Reading

- [Architecture Overview](../architecture/overview.md)
- [Clean Architecture Guide](../architecture/clean-architecture.md)
- [Domain Logic Guide](../packages/core.md)
