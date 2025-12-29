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
 * @see {@link https://sre.google/sre-book/chapters/monitoring/ | Google SRE Monitoring}
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

  recordHttpRequest(method, route, statusCode, duration) {
    this.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration / 1000);
    this.httpRequestTotal.labels(method, route, statusCode.toString()).inc();
  }

  recordHttpError(method, route, errorType) {
    this.httpErrorsTotal.labels(method, route, errorType).inc();
  }

  recordTaskCreated(workspaceId, projectId, priority = 'MEDIUM') {
    this.tasksCreatedTotal
      .labels(workspaceId, projectId || 'none', priority)
      .inc();
  }

  recordTaskCompleted(workspaceId, projectId) {
    this.tasksCompletedTotal.labels(workspaceId, projectId || 'none').inc();
  }

  recordSubtaskCompleted(workspaceId, projectId) {
    this.subtasksCompletedTotal.labels(workspaceId, projectId || 'none').inc();
  }

  recordPomodoroCompleted(workspaceId, projectId) {
    this.pomodorosCompletedTotal.labels(workspaceId, projectId || 'none').inc();
  }

  recordTimerSession(type, taskType) {
    this.timerSessionsTotal.labels(type, taskType || 'general').inc();
  }

  recordTimerSessionDuration(type, taskType, duration) {
    this.timerSessionDuration
      .labels(type, taskType || 'general')
      .observe(duration);
  }

  recordFocusScore(score) {
    this.focusScoreGauge.set(score);
  }

  recordTaskCompletionTime(priority, duration) {
    this.averageTaskCompletionTime.labels(priority).observe(duration);
  }

  recordDbQuery(queryType, table, duration) {
    this.dbQueryDuration.labels(queryType, table).observe(duration / 1000);
  }

  recordDbConnectionPool(poolSize) {
    this.dbConnectionPoolGauge.set(poolSize);
  }

  collectSystemMetrics() {
    const memoryUsage = process.memoryUsage();
    this.processResidentMemoryBytes.set(memoryUsage.rss);
    this.processHeapBytes.set(memoryUsage.heapTotal);
  }

  async getMetrics() {
    return register.metrics();
  }

  resetAll() {
    register.resetMetrics();
  }
}
