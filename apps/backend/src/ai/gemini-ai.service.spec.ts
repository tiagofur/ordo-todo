import { Test, TestingModule } from '@nestjs/testing';
import { GeminiAIService } from './gemini-ai.service';
import { ConfigService } from '@nestjs/config';

describe('GeminiAIService', () => {
    let service: GeminiAIService;
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GeminiAIService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            if (key === 'GEMINI_API_KEY') return undefined; // No API key in tests
                            return undefined;
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<GeminiAIService>(GeminiAIService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('isAvailable', () => {
        it('should return false when API key is not configured', () => {
            expect(service.isAvailable()).toBe(false);
        });
    });

    describe('getModelStats', () => {
        it('should return initial stats with zero counts', () => {
            const stats = service.getModelStats();
            expect(stats).toEqual({
                flash: 0,
                thinking: 0,
                estimatedCostSavings: expect.any(String),
            });
        });
    });

    describe('chat (fallback mode)', () => {
        it('should return fallback message when AI is not available', async () => {
            const result = await service.chat('Hello');
            expect(result).toEqual({
                message: 'El servicio de IA no está disponible. Configura GEMINI_API_KEY.',
                actions: [],
            });
        });
    });

    describe('parseNaturalLanguageTask (fallback mode)', () => {
        it('should use local parsing when AI is not available', async () => {
            const result = await service.parseNaturalLanguageTask('Tarea urgente: revisar código');
            expect(result).toHaveProperty('title');
            expect(result).toHaveProperty('priority');
            expect(result.confidence).toBe('LOW');
            expect(result.reasoning).toContain('GEMINI_API_KEY');
        });

        it('should detect urgent priority from keywords', async () => {
            const result = await service.parseNaturalLanguageTask('Urgente: deploy production');
            expect(result.priority).toBe('URGENT');
        });

        it('should detect high priority from keywords', async () => {
            const result = await service.parseNaturalLanguageTask('Importante: revisar PR');
            expect(result.priority).toBe('HIGH');
        });

        it('should extract time estimates', async () => {
            const result = await service.parseNaturalLanguageTask('Estudiar por 2 horas');
            expect(result.estimatedMinutes).toBe(120);
        });

        it('should extract minute-based time estimates', async () => {
            const result = await service.parseNaturalLanguageTask('Revisar en 30 minutos');
            expect(result.estimatedMinutes).toBe(30);
        });
    });

    describe('decomposeTask (fallback mode)', () => {
        it('should return default decomposition when AI is not available', async () => {
            const result = await service.decomposeTask('Implementar feature');
            expect(result.subtasks).toHaveLength(3);
            expect(result.subtasks[0].title).toContain('Planificar');
            expect(result.subtasks[1].title).toContain('Ejecutar');
            expect(result.subtasks[2].title).toContain('Revisar');
            expect(result.totalEstimatedMinutes).toBe(120);
        });

        it('should include task title in subtask names', async () => {
            const result = await service.decomposeTask('Deploy to production');
            expect(result.subtasks[0].title).toContain('Deploy to production');
        });
    });

    describe('suggestWorkflow (fallback mode)', () => {
        it('should return default workflow when AI is not available', async () => {
            const result = await service.suggestWorkflow('New Project');
            expect(result).toHaveProperty('phases');
            expect(result).toHaveProperty('estimatedDuration');
            expect(result).toHaveProperty('tips');
            expect(result.phases.length).toBeGreaterThan(0);
        });
    });

    describe('analyzeWellbeing (fallback mode)', () => {
        it('should return local metrics when AI is not available', async () => {
            const result = await service.analyzeWellbeing({
                dailyMetrics: [],
                sessions: [],
                profile: null,
            });

            expect(result).toHaveProperty('overallScore');
            expect(result).toHaveProperty('burnoutRisk');
            expect(result).toHaveProperty('workLifeBalance');
            expect(result).toHaveProperty('focusQuality');
            expect(result.insights).toContain('Análisis local - configura GEMINI_API_KEY para insights de IA');
        });
    });

    describe('estimateTaskDuration (fallback mode)', () => {
        it('should return fallback estimation when AI is not available', async () => {
            const result = await service.estimateTaskDuration('Test task', undefined, 30);
            expect(result).toEqual({
                estimatedMinutes: 30,
                confidence: 'LOW',
                reasoning: 'Estimación basada en promedio histórico (Modo Offline).',
            });
        });
    });
});
