import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  AgentToolCallDto,
  ExecutePlanDto,
  ProposePlanDto,
} from './agent-tools.dto';

/**
 * DTO validation tests (ODD 004 S3).
 *
 * The global ValidationPipe (whitelist + transform) enforces these
 * decorators at the HTTP boundary; semantic arg validation lives in
 * AgentToolsService, not here.
 */
describe('agent tools DTOs', () => {
  describe('ProposePlanDto', () => {
    it('accepts 1..20 well-formed calls', async () => {
      const dto = plainToInstance(ProposePlanDto, {
        calls: [{ tool: 'complete_task', args: { taskId: 't1' } }],
      });
      expect(await validate(dto)).toHaveLength(0);
    });

    it('rejects an empty calls array', async () => {
      const dto = plainToInstance(ProposePlanDto, { calls: [] });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects more than 20 calls (abuse cap)', async () => {
      const dto = plainToInstance(ProposePlanDto, {
        calls: Array.from({ length: 21 }, () => ({
          tool: 'complete_task',
          args: { taskId: 't1' },
        })),
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects unknown tool names', async () => {
      const dto = plainToInstance(ProposePlanDto, {
        calls: [{ tool: 'drop_database', args: {} }],
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects non-object args', async () => {
      const dto = plainToInstance(ProposePlanDto, {
        calls: [{ tool: 'complete_task', args: 't1' }],
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('ExecutePlanDto', () => {
    it('accepts a full execute payload', async () => {
      const dto = plainToInstance(ExecutePlanDto, {
        planId: 'some-uuid',
        calls: [{ tool: 'complete_task', args: { taskId: 't1' } }],
        confirmed: true,
      });
      expect(await validate(dto)).toHaveLength(0);
    });

    it('rejects non-boolean confirmed', async () => {
      const dto = plainToInstance(ExecutePlanDto, {
        planId: 'some-uuid',
        calls: [{ tool: 'complete_task', args: { taskId: 't1' } }],
        confirmed: 'yes',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('validates nested calls', async () => {
      const dto = plainToInstance(ExecutePlanDto, {
        planId: 'some-uuid',
        calls: [{ tool: 'nope', args: {} }],
        confirmed: false,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('AgentToolCallDto', () => {
    it('accepts free-form args objects (semantic validation is server-side)', async () => {
      const dto = plainToInstance(AgentToolCallDto, {
        tool: 'create_task',
        args: { title: 'x', anything: [1, { deep: true }] },
      });
      expect(await validate(dto)).toHaveLength(0);
    });
  });
});
