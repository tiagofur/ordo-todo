import { Test, TestingModule } from '@nestjs/testing';
import { TaskNlParserService } from './task-nl-parser.service';

describe('TaskNlParserService', () => {
  let parser: TaskNlParserService;

  // Fixed reference: Monday 2026-10-19 09:00 UTC.
  const NOW = new Date('2026-10-19T09:00:00Z');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskNlParserService],
    }).compile();

    parser = module.get<TaskNlParserService>(TaskNlParserService);
  });

  function parse(input: string) {
    return parser.parse(input, NOW);
  }

  describe('Spanish matrix (10)', () => {
    it.each([
      ['Llamar a Ana mañana 15h #trabajo @alta', 'Llamar a Ana', '2026-10-20T15:00', 'HIGH', 'trabajo', null],
      ['Informe viernes 9h', 'Informe', '2026-10-23T09:00', 'MEDIUM', null, null],
      ['Revisar PR hoy', 'Revisar PR', '2026-10-19T09:00', 'MEDIUM', null, null],
      ['Comprar leche urgente', 'Comprar leche', null, 'URGENT', null, null],
      ['Regar plantas todos los días', 'Regar plantas', null, 'MEDIUM', null, 'DAILY'],
      ['Dentista el lunes que viene 10:30', 'Dentista', '2026-10-26T10:30', 'MEDIUM', null, null],
      ['Enviar propuesta 25/10 #ventas', 'Enviar propuesta', '2026-10-25T09:00', 'MEDIUM', 'ventas', null],
      ['Gym cada lunes y miércoles', 'Gym', null, 'MEDIUM', null, 'WEEKLY'],
      ['Pagar alquiler día 1 @baja', 'Pagar alquiler', '2026-11-01T09:00', 'LOW', null, 'MONTHLY'],
      ['Llamar al banco mañana @urgente #personal', 'Llamar al banco', '2026-10-20T09:00', 'URGENT', 'personal', null],
    ])(
      'parses %p',
      (input, title, dueAt, priority, projectHint, recurrence, ) => {
        const result = parse(input as string);
        expect(result.title).toBe(title);
        if (dueAt) {
          expect(result.dueAt?.toISOString().slice(0, 16)).toBe(dueAt);
        } else {
          expect(result.dueAt).toBeUndefined();
        }
        expect(result.priority).toBe(priority);
        expect(result.projectHint ?? null).toBe(projectHint);
        expect(result.recurrence ?? null).toBe(recurrence);
        expect(result.confidenceScore).toBeGreaterThanOrEqual(0.6);
      },
    );
  });

  describe('English matrix (10)', () => {
    it.each([
      ['Call Ana tomorrow 3pm #work @high', 'Call Ana', '2026-10-20T15:00', 'HIGH', 'work', null],
      ['Report friday 9am', 'Report', '2026-10-23T09:00', 'MEDIUM', null, null],
      ['Review PR today', 'Review PR', '2026-10-19T09:00', 'MEDIUM', null, null],
      ['Buy milk urgent', 'Buy milk', null, 'URGENT', null, null],
      ['Water plants every day', 'Water plants', null, 'MEDIUM', null, 'DAILY'],
      ['Dentist next monday 10:30am', 'Dentist', '2026-10-26T10:30', 'MEDIUM', null, null],
      ['Send proposal 10/25 #sales', 'Send proposal', '2026-10-25T09:00', 'MEDIUM', 'sales', null],
      ['Gym every weekday', 'Gym', null, 'MEDIUM', null, 'WEEKLY'],
      ['Pay rent on the 1st @low', 'Pay rent', '2026-11-01T09:00', 'LOW', null, 'MONTHLY'],
      ['File taxes yearly in april', 'File taxes', null, 'MEDIUM', null, 'YEARLY'],
    ])(
      'parses %p',
      (input, title, dueAt, priority, projectHint, recurrence, ) => {
        const result = parse(input as string);
        expect(result.title).toBe(title);
        if (dueAt) {
          expect(result.dueAt?.toISOString().slice(0, 16)).toBe(dueAt);
        } else {
          expect(result.dueAt).toBeUndefined();
        }
        expect(result.priority).toBe(priority);
        expect(result.projectHint ?? null).toBe(projectHint);
        expect(result.recurrence ?? null).toBe(recurrence);
        expect(result.confidenceScore).toBeGreaterThanOrEqual(0.6);
      },
    );
  });

  describe('Portuguese matrix (10)', () => {
    it.each([
      ['Ligar para Ana amanhã 15h #trabalho @alta', 'Ligar para Ana', '2026-10-20T15:00', 'HIGH', 'trabalho', null],
      ['Relatório sexta 9h', 'Relatório', '2026-10-23T09:00', 'MEDIUM', null, null],
      ['Revisar PR hoje', 'Revisar PR', '2026-10-19T09:00', 'MEDIUM', null, null],
      ['Comprar leite urgente', 'Comprar leite', null, 'URGENT', null, null],
      ['Regar plantas todo dia', 'Regar plantas', null, 'MEDIUM', null, 'DAILY'],
      ['Dentista segunda que vem 10:30', 'Dentista', '2026-10-26T10:30', 'MEDIUM', null, null],
      ['Enviar proposta 25/10 #vendas', 'Enviar proposta', '2026-10-25T09:00', 'MEDIUM', 'vendas', null],
      ['Academia toda segunda', 'Academia', null, 'MEDIUM', null, 'WEEKLY'],
      ['Pagar aluguel dia 1 @baixa', 'Pagar aluguel', '2026-11-01T09:00', 'LOW', null, 'MONTHLY'],
      ['Reunião amanhã @urgente #pessoal', 'Reunião', '2026-10-20T09:00', 'URGENT', 'pessoal', null],
    ])(
      'parses %p',
      (input, title, dueAt, priority, projectHint, recurrence, ) => {
        const result = parse(input as string);
        expect(result.title).toBe(title);
        if (dueAt) {
          expect(result.dueAt?.toISOString().slice(0, 16)).toBe(dueAt);
        } else {
          expect(result.dueAt).toBeUndefined();
        }
        expect(result.priority).toBe(priority);
        expect(result.projectHint ?? null).toBe(projectHint);
        expect(result.recurrence ?? null).toBe(recurrence);
        expect(result.confidenceScore).toBeGreaterThanOrEqual(0.6);
      },
    );
  });

  describe('confidence behavior', () => {
    it('should return low confidence for unparseable input', () => {
      const result = parse('asdf qwer zxcv');
      expect(result.confidenceScore).toBeLessThan(0.6);
      expect(result.title).toBe('asdf qwer zxcv');
    });

    it('should strip parsed tokens from the title', () => {
      const result = parse('Llamar a Ana mañana 15h #trabajo @alta');
      expect(result.title).not.toContain('mañana');
      expect(result.title).not.toContain('#trabajo');
      expect(result.title).not.toContain('@alta');
    });
  });
});
