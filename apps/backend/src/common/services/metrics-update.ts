import { Injectable } from '@nestjs/common';
import { Counter, Histogram, register, Gauge } from 'prom-client';

/**
 * Metrics Service
 *
 * Implements Prometheus metrics for monitoring application health and business KPIs.
 * Follows Google/Netflix standards for observability.
 *
 * Metrics Collected:
 * - HTTP: request duration, request count, error count
 * - Business: tasks created, tasks completed, pomodoros, focus score
 * - Database: query duration, connection pool
 * - System: memory usage, CPU (if available)
 *
 * @see {@link https://prometheus.io/docs/practices/naming/ | Prometheus Naming Conventions}
 * @see {@link https://sre.google/sre-book/chapters/monitoring/tracing/ | Google SRE Monitoring}
 */
@Injectable()
export class MetricsService {
  // HTTP Metrics
  private readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [register],
  });

  private readonly httpRequestTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
  });

  private readonly httpErrorsTotal = new Counter({
    name: 'http_errors_total',
    help: 'Total number of HTTP errors',
    labelNames: ['method', 'route', 'error_type'],
    registers: [register],
  });

  // Business Metrics
  private readonly tasksCreatedTotal = new Counter({
    name: 'tasks_created_total',
    help: 'Total number of tasks created',
    labelNames: ['workspace_id', 'project_id', 'priority'],
    registers: [register],
  });

  private readonly tasksCompletedTotal = new Counter({
    name: 'tasks_completed_total',
    help: 'Total number of tasks completed',
    labelNames: ['workspace_id', 'project_id'],
    registers: [register],
  });

  private readonly subtasksCompletedTotal = new Counter({
    name: 'subtasks_completed_total',
    help: 'Total number of subtasks completed',
    labelNames: ['workspace_id', 'project_id'],
    registers: [register],
  });

  private readonly pomodorosCompletedTotal = new Counter({
    name: 'pomodoros_completed_total',
    help: 'Total number of pomodoro sessions completed',
    labelNames: ['workspace_id', 'project_id'],
    registers: [register],
  });

  private readonly timerSessionsTotal = new Counter({
    name: 'timer_sessions_total',
    help: 'Total number of timer sessions',
    labelNames: ['type', 'task_type'],
    registers: [register],
  });

  private readonly timerSessionDuration = new Histogram({
    name: 'timer_session_duration_seconds',
    help: 'Duration of timer sessions in seconds',
    labelNames: ['type', 'task_type'],
    buckets: [300, 600, 900, 1800, 3600, 7200, 14400],
    registers: [register],
  });

  private readonly focusScoreGauge = new Gauge({
    name: 'focus_score_value',
    help: 'Average focus score across all users',
    registers: [register],
  });

  private readonly averageTaskCompletionTime = new Histogram({
    name: 'task_completion_duration_seconds',
    help: 'Duration of task completion in seconds',
    labelNames: ['priority'],
    buckets: [60, 300, 600, 1800, 3600, 7200, 86400],
    registers: [register],
  });

  // Database Metrics
  private readonly dbQueryDuration = new Histogram({
    name: 'db_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['query_type', 'table'],
    buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
    registers: [register],
  });

  private readonly dbConnectionPoolGauge = new Gauge({
    name: 'db_connection_pool_size',
    help: 'Number of database connections in pool',
    registers: [register],
  });

  // System Metrics
  private readonly processResidentMemoryBytes = new Gauge({
    name: 'process_resident_memory_bytes',
    help: 'Resident memory size in bytes',
    registers: [register],
  });

  private readonly processHeapBytes = new Gauge({
    name: 'process_heap_bytes_total',
    help: 'Process heap size in bytes',
    registers: [register],
  });

  /**
   * Records an HTTP request with duration
   *
   * @param method - HTTP method (GET, POST, etc.)
   * @param route - Request route path
   * @param statusCode - HTTP status code
   * @param duration - Request duration in seconds
   */
  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ): void {
    this.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration / 1000);
    this.httpRequestTotal.labels(method, route, statusCode.toString()).inc();
  }

  /**
   * Records an HTTP error
   *
   * @param method - HTTP method
   * @param route - Request route path
   * @param errorType - Type of error (validation, not_found, server_error, etc.)
   */
  recordHttpError(method: string, route: string, errorType: string): void {
    this.httpErrorsTotal.labels(method, route, errorType).inc();
  }

  /**
   * Records a task creation
   *
   * @param workspaceId - Workspace ID
   * @param projectId - Optional project ID
   * @param priority - Task priority (LOW, MEDIUM, HIGH, URGENT)
   */
  recordTaskCreated(
    workspaceId: string,
    projectId?: string,
    priority: string = 'MEDIUM',
  ): void {
    this.tasksCreatedTotal
      .labels(workspaceId, projectId || 'none', priority)
      .inc();
  }

  /**
   * Records a task completion
   *
   * @param workspaceId - Workspace ID
   * @param projectId - Optional project ID
   */
  recordTaskCompleted(workspaceId: string, projectId?: string): void {
    this.tasksCompletedTotal.labels(workspaceId, projectId || 'none').inc();
  }

  /**
   * Records a subtask completion
   *
   * @param workspaceId - Workspace ID
   * @param projectId - Optional project ID
   */
  recordSubtaskCompleted(workspaceId: string, projectId?: string): void {
    this.subtasksCompletedTotal.labels(workspaceId, projectId || 'none').inc();
  }

  /**
   * Records a pomodoro session completion
   *
   @param workspaceId - Workspace ID
   * @param projectId - Optional project ID
   */
  recordPomodoroCompleted(workspaceId: string, projectId?: string): void {
    this.pomodorosCompletedTotal.labels(workspaceId, projectId || 'none').inc();
  }

  /**
   * Records a timer session
   *
   * @param type - Timer type (WORK, POMODORO, CONTINUOUS)
   * @param taskType - Optional task type/category
   */
  recordTimerSession(type: string, taskType?: string): void {
    this.timerSessionsTotal.labels(type, taskType || 'general').inc();
  }

  /**
   * Records timer session duration
   *
   * @param type - Timer type (WORK, POMODORO, CONTINUOUS)
   * @param taskType - Optional task type/category
   * @param duration - Session duration in seconds
   */
  recordTimerSessionDuration(
    type: string,
    duration: number,
    taskType?: string,
  ): void {
    this.timerSessionDuration
      .labels(type, taskType || 'general')
      .observe(duration);
  }

  /**
   * Records focus score value
   *
   * @param score - Focus score (0.0 to 1.0)
   */
  recordFocusScore(score: number): void {
    this.focusScoreGauge.set(score);
  }

  /**
   * Records task completion time
   *
   * @param priority - Task priority (LOW, MEDIUM, HIGH, URGENT)
   * @param duration - Completion duration in seconds
   */
  recordTaskCompletionTime(priority: string, duration: number): void {
    this.averageTaskCompletionTime.labels(priority).observe(duration);
  }

  /**
   * Records database query duration
   *
   * @param queryType - Type of query (SELECT, INSERT, UPDATE, DELETE)
   * @param table - Database table name
   * @param duration - Query duration in seconds
   */
  recordDbQuery(queryType: string, table: string, duration: number): void {
    this.dbQueryDuration.labels(queryType, table).observe(duration / 1000);
  }
}
