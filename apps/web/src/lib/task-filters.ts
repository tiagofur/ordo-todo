import { TaskFilters } from "@/components/tasks/quick-filters";

/**
 * Serializes task filters into a URLSearchParams object
 */
export function serializeFilters(filters: TaskFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.status?.length) {
    params.set("status", filters.status.join(","));
  }

  if (filters.priority?.length) {
    params.set("priority", filters.priority.join(","));
  }

  if (filters.dueDateRange) {
    params.set("due", filters.dueDateRange);
  }

  if (filters.assignedToMe) {
    params.set("assigned", "true");
  }

  if (filters.hasSubtasks !== undefined) {
    params.set("subtasks", filters.hasSubtasks.toString());
  }

  if (filters.projectId) {
    params.set("project", filters.projectId);
  }

  if (filters.tagIds?.length) {
    params.set("tags", filters.tagIds.join(","));
  }

  return params;
}

/**
 * Deserializes task filters from a URLSearchParams object
 */
export function deserializeFilters(params: URLSearchParams): TaskFilters {
  const filters: TaskFilters = {};

  const status = params.get("status");
  if (status) {
    filters.status = status.split(",") as any;
  }

  const priority = params.get("priority");
  if (priority) {
    filters.priority = priority.split(",") as any;
  }

  const due = params.get("due");
  if (due) {
    filters.dueDateRange = due as any;
  }

  const assigned = params.get("assigned");
  if (assigned === "true") {
    filters.assignedToMe = true;
  }

  const subtasks = params.get("subtasks");
  if (subtasks) {
    filters.hasSubtasks = subtasks === "true";
  }

  const project = params.get("project");
  if (project) {
    filters.projectId = project;
  }

  const tags = params.get("tags");
  if (tags) {
    filters.tagIds = tags.split(",");
  }

  return filters;
}
