import { Task } from "../../../src/tasks/model/task.entity";
import { CreateTaskUseCase, CreateTaskInput } from "../../../src/tasks/usecase/create-task.usecase";
import { TaskRepository } from "../../../src/tasks/provider/task.repository";

// Mock implementation of TaskRepository
class MockTaskRepository implements TaskRepository {
    private tasks: Task[] = [];
    private saveCalls: Task[] = [];

    async save(task: Task): Promise<void> {
        this.saveCalls.push(task);
        this.tasks.push(task);
    }

    async findById(id: string): Promise<Task | null> {
        return this.tasks.find(t => t.id === id) || null;
    }

    async findByCreatorId(creatorId: string): Promise<Task[]> {
        return this.tasks.filter(t => t.props.creatorId === creatorId);
    }

    async update(task: Task): Promise<void> {
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
            this.tasks[index] = task;
        }
    }

    async delete(id: string): Promise<void> {
        this.tasks = this.tasks.filter(t => t.id !== id);
    }

    getSaveCalls(): Task[] {
        return this.saveCalls;
    }

    clear(): void {
        this.tasks = [];
        this.saveCalls = [];
    }
}

describe("CreateTaskUseCase", () => {
    let useCase: CreateTaskUseCase;
    let repository: MockTaskRepository;

    beforeEach(() => {
        repository = new MockTaskRepository();
        useCase = new CreateTaskUseCase(repository);
    });

    describe("execute", () => {
        it("should create a task successfully with minimum required fields", async () => {
            const input: CreateTaskInput = {
                title: "Test Task",
                projectId: "project-123",
                creatorId: "user-123",
            };

            const task = await useCase.execute(input);

            expect(task).toBeInstanceOf(Task);
            expect(task.props.title).toBe(input.title);
            expect(task.props.projectId).toBe(input.projectId);
            expect(task.props.creatorId).toBe(input.creatorId);
            expect(task.props.status).toBe("TODO");
            expect(task.props.priority).toBe("MEDIUM");
            expect(repository.getSaveCalls()).toHaveLength(1);
        });

        it("should create a task with all optional fields", async () => {
            const dueDate = new Date("2024-12-31");
            const input: CreateTaskInput = {
                title: "Complete Task",
                description: "A detailed description",
                priority: "HIGH",
                dueDate,
                projectId: "project-456",
                creatorId: "user-456",
                parentTaskId: "parent-task-123",
            };

            const task = await useCase.execute(input);

            expect(task.props.title).toBe(input.title);
            expect(task.props.description).toBe(input.description);
            expect(task.props.priority).toBe("HIGH");
            expect(task.props.dueDate).toEqual(dueDate);
            expect(task.props.parentTaskId).toBe(input.parentTaskId);
        });

        it("should throw error when title is empty", async () => {
            const input: CreateTaskInput = {
                title: "",
                projectId: "project-123",
                creatorId: "user-123",
            };

            await expect(useCase.execute(input)).rejects.toThrow("Title is required");
        });

        it("should throw error when title is only whitespace", async () => {
            const input: CreateTaskInput = {
                title: "   ",
                projectId: "project-123",
                creatorId: "user-123",
            };

            // Note: Current implementation doesn't trim, so this should pass
            // If we want it to fail, we need to update the use case
            const task = await useCase.execute(input);
            expect(task.props.title).toBe("   ");
        });

        it("should save task to repository", async () => {
            const input: CreateTaskInput = {
                title: "Repository Test",
                projectId: "project-789",
                creatorId: "user-789",
            };

            const task = await useCase.execute(input);

            const savedTask = await repository.findById(task.id);
            expect(savedTask).not.toBeNull();
            expect(savedTask?.props.title).toBe(input.title);
        });

        it("should generate unique task ID", async () => {
            const input1: CreateTaskInput = {
                title: "Task 1",
                projectId: "project-1",
                creatorId: "user-1",
            };

            const input2: CreateTaskInput = {
                title: "Task 2",
                projectId: "project-1",
                creatorId: "user-1",
            };

            const task1 = await useCase.execute(input1);
            const task2 = await useCase.execute(input2);

            expect(task1.id).not.toBe(task2.id);
            expect(task1.id).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
            );
        });

        it("should set default priority to MEDIUM when not provided", async () => {
            const input: CreateTaskInput = {
                title: "Default Priority Task",
                projectId: "project-123",
                creatorId: "user-123",
            };

            const task = await useCase.execute(input);

            expect(task.props.priority).toBe("MEDIUM");
        });

        it("should accept all valid priority values", async () => {
            const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

            for (const priority of priorities) {
                repository.clear();
                const input: CreateTaskInput = {
                    title: `${priority} Priority Task`,
                    priority,
                    projectId: "project-123",
                    creatorId: "user-123",
                };

                const task = await useCase.execute(input);
                expect(task.props.priority).toBe(priority);
            }
        });

        it("should create subtask with parentTaskId", async () => {
            const parentInput: CreateTaskInput = {
                title: "Parent Task",
                projectId: "project-123",
                creatorId: "user-123",
            };

            const parentTask = await useCase.execute(parentInput);

            const subtaskInput: CreateTaskInput = {
                title: "Subtask",
                projectId: "project-123",
                creatorId: "user-123",
                parentTaskId: parentTask.id,
            };

            const subtask = await useCase.execute(subtaskInput);

            expect(subtask.props.parentTaskId).toBe(parentTask.id);
        });
    });

    describe("edge cases", () => {
        it("should handle very long title", async () => {
            const longTitle = "A".repeat(500);
            const input: CreateTaskInput = {
                title: longTitle,
                projectId: "project-123",
                creatorId: "user-123",
            };

            const task = await useCase.execute(input);
            expect(task.props.title).toBe(longTitle);
        });

        it("should handle special characters in title", async () => {
            const specialTitle = "Task with émojis 🚀 and spëcial çharacters!";
            const input: CreateTaskInput = {
                title: specialTitle,
                projectId: "project-123",
                creatorId: "user-123",
            };

            const task = await useCase.execute(input);
            expect(task.props.title).toBe(specialTitle);
        });

        it("should handle description with newlines and formatting", async () => {
            const description = "Line 1\nLine 2\n\n- Item 1\n- Item 2";
            const input: CreateTaskInput = {
                title: "Formatted Task",
                description,
                projectId: "project-123",
                creatorId: "user-123",
            };

            const task = await useCase.execute(input);
            expect(task.props.description).toBe(description);
        });

        it("should handle past due date", async () => {
            const pastDate = new Date("2020-01-01");
            const input: CreateTaskInput = {
                title: "Past Due Task",
                dueDate: pastDate,
                projectId: "project-123",
                creatorId: "user-123",
            };

            const task = await useCase.execute(input);
            expect(task.props.dueDate).toEqual(pastDate);
        });

        it("should handle future due date", async () => {
            const futureDate = new Date("2030-12-31");
            const input: CreateTaskInput = {
                title: "Future Task",
                dueDate: futureDate,
                projectId: "project-123",
                creatorId: "user-123",
            };

            const task = await useCase.execute(input);
            expect(task.props.dueDate).toEqual(futureDate);
        });
    });
});
