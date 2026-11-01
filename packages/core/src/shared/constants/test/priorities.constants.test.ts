import { describe, expect, it } from '@jest/globals';
import {
    getPriorityConfig,
    PRIORITY_VALUES,
} from '../priorities.constants';
import { taskBaseSchema } from '../../validation/task.validation';

describe('task priorities', () => {
    it('includes URGENT like the Task entity and hooks schemas', () => {
        expect(PRIORITY_VALUES).toContain('URGENT');
    });

    it('orders URGENT after HIGH', () => {
        expect(getPriorityConfig('URGENT').order).toBeGreaterThan(
            getPriorityConfig('HIGH').order
        );
    });

    it('accepts URGENT in the shared task schema', () => {
        const parsed = taskBaseSchema.safeParse({
            title: 'Urgent task',
            priority: 'URGENT',
        });
        expect(parsed.success).toBe(true);
    });
});
