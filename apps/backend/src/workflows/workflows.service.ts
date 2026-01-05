import { Injectable, Inject } from '@nestjs/common';
import type { WorkflowRepository } from '@ordo-todo/core';
import {
  CreateWorkflowUseCase,
  ListWorkflowsUseCase,
  UpdateWorkflowUseCase,
  DeleteWorkflowUseCase,
} from '@ordo-todo/core';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';

@Injectable()
export class WorkflowsService {
  constructor(
    @Inject('WorkflowRepository')
    private readonly workflowRepository: WorkflowRepository,
  ) {}

  async create(createWorkflowDto: CreateWorkflowDto) {
    const createWorkflowUseCase = new CreateWorkflowUseCase(
      this.workflowRepository,
    );
    const workflow = await createWorkflowUseCase.execute(createWorkflowDto);
    return workflow.props;
  }

  async findAll(workspaceId: string) {
    const listWorkflowsUseCase = new ListWorkflowsUseCase(
      this.workflowRepository,
    );
    const workflows = await listWorkflowsUseCase.execute(workspaceId);
    return workflows.map((w) => w.props);
  }

  async findOne(id: string) {
    const workflow = await this.workflowRepository.findById(id);
    if (!workflow) {
      return null;
    }
    return workflow.props;
  }

  async update(id: string, updateWorkflowDto: UpdateWorkflowDto) {
    const updateWorkflowUseCase = new UpdateWorkflowUseCase(
      this.workflowRepository,
    );
    const workflow = await updateWorkflowUseCase.execute({
      id,
      ...updateWorkflowDto,
    });
    return workflow.props;
  }

  async remove(id: string) {
    const deleteWorkflowUseCase = new DeleteWorkflowUseCase(
      this.workflowRepository,
    );
    await deleteWorkflowUseCase.execute(id);
    return { success: true };
  }
}
