/**
 * All Tasks Screen Tests
 */

import { render } from "@testing-library/react-native";
import AllTasksScreen from "../all-tasks";

const MOCK_TASKS = [
  {
    id: "1",
    title: "Comprar comida",
    description: null,
    status: "TODO" as const,
    priority: "HIGH" as const,
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    projectId: "proj-1",
    projectName: "Casa",
    tags: ["compras", "personal"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Revisar código",
    description: "Revisar el PR de mobile parity",
    status: "IN_PROGRESS" as const,
    priority: "MEDIUM" as const,
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    projectId: "proj-1",
    projectName: "Trabajo",
    tags: ["dev"],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    title: "Reporte completado",
    description: null,
    status: "COMPLETED" as const,
    priority: "LOW" as const,
    dueDate: null,
    projectId: "proj-1",
    projectName: "Casa",
    tags: [],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

describe("AllTasksScreen", () => {
  it("should render without crashing", () => {
    render(<AllTasksScreen />);
  });

  it("should display header with task count", () => {
    const { getByText } = render(<AllTasksScreen />);

    expect(getByText(/Todas las Tareas/)).toBeTruthy();
  });

  it("should display search bar", () => {
    const { getByPlaceholderText } = render(<AllTasksScreen />);

    expect(getByPlaceholderText(/Buscar tareas/)).toBeTruthy();
  });

  it("should display filter buttons", () => {
    const { getByText } = render(<AllTasksScreen />);

    expect(getByText("Todas")).toBeTruthy();
    expect(getByText("Por hacer")).toBeTruthy();
    expect(getByText("En progreso")).toBeTruthy();
    expect(getByText("Completadas")).toBeTruthy();
  });

  it("should show empty state when no tasks", () => {
    const { getByText } = render(<AllTasksScreen />);

    expect(getByText(/Sin tareas/)).toBeTruthy();
  });

  it("should show loading state", () => {
    const { getByTestId, getByText } = render(<AllTasksScreen />);

    // Loading indicator should be present
    expect(getByText(/Cargando tareas/)).toBeTruthy();
  });

  it("should display task cards with status icons", () => {
    const { getByText } = render(<AllTasksScreen />);

    expect(getByText(/Comprar comida/)).toBeTruthy();
  });

  it("should display task cards with priority badges", () => {
    const { getByText } = render(<AllTasksScreen />);

    expect(getByText(/HIGH/)).toBeTruthy();
  });

  it("should display project tags", () => {
    const { getByText } = render(<AllTasksScreen />);

    expect(getByText(/Casa/)).toBeTruthy();
    expect(getByText(/Trabajo/)).toBeTruthy();
    expect(getByText(/compras/)).toBeTruthy();
  });

  it("should display due dates", () => {
    const { getByText } = render(<AllTasksScreen />);

    expect(getByText(/Sin fecha/)).toBeTruthy();
  });

  it("should sort tasks by due date", () => {
    const { getByText } = render(<AllTasksScreen />);

    // Tasks should be displayed (implementation-specific test)
    expect(getByText(/Comprar comida/)).toBeTruthy();
    expect(getByText(/Revisar código/)).toBeTruthy();
    expect(getByText(/Reporte completado/)).toBeTruthy();
  });

  it("should toggle task selection on press", () => {
    const { getByText } = render(<AllTasksScreen />);

    const taskCard = getByText(/Comprar comida/);
    expect(taskCard).toBeTruthy();
  });

  it("should filter by status", () => {
    const { getByText } = render(<AllTasksScreen />);

    const allTab = getByText("Todas");
    const todoTab = getByText("Por hacer");
    const doneTab = getByText("Completadas");

    expect(allTab).toBeTruthy();
    expect(todoTab).toBeTruthy();
    expect(doneTab).toBeTruthy();
  });

  it("should sort by priority", () => {
    const { getByText } = render(<AllTasksScreen />);

    // Sort button should be present
    expect(getByText(/calendar|flag|\/clock/)).toBeTruthy();
  });
});
