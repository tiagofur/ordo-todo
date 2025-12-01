import { ProductivityReport, ReportScope } from "../model/productivity-report.entity";

export interface ProductivityReportRepository {
  /**
   * Save a new productivity report
   */
  save(report: ProductivityReport): Promise<ProductivityReport>;

  /**
   * Find report by ID
   */
  findById(id: string): Promise<ProductivityReport | null>;

  /**
   * Find all reports for a user
   */
  findByUserId(userId: string, options?: {
    scope?: ReportScope;
    limit?: number;
    offset?: number;
  }): Promise<ProductivityReport[]>;

  /**
   * Find reports for a specific task
   */
  findByTaskId(taskId: string): Promise<ProductivityReport[]>;

  /**
   * Find reports for a specific project
   */
  findByProjectId(projectId: string): Promise<ProductivityReport[]>;

  /**
   * Find latest report by scope
   */
  findLatestByScope(userId: string, scope: ReportScope): Promise<ProductivityReport | null>;

  /**
   * Delete a report
   */
  delete(id: string): Promise<void>;

  /**
   * Count reports for a user
   */
  countByUserId(userId: string, scope?: ReportScope): Promise<number>;
}
