/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CreateTaskDialog,
  type CreateTaskDialogProps,
} from "../create-task-dialog.js";

const sampleProjects = [
  { id: "proj-1", name: "Work", color: "#3b82f6" },
  { id: "proj-2", name: "Personal", color: "#10b981" },
];

const sampleMembers = [
  { id: "m1", user: { id: "u1", name: "Alice", email: "alice@test.com" } },
  { id: "m2", user: { id: "u2", name: "Bob", email: "bob@test.com" } },
];

function setup(overrides: Partial<CreateTaskDialogProps> = {}) {
  const props: CreateTaskDialogProps = {
    open: true,
    onOpenChange: vi.fn(),
    projects: sampleProjects,
    assignableMembers: sampleMembers,
    onSubmit: vi.fn(),
    labels: {
      title: "Crear Tarea",
      description: "Añade una nueva tarea",
      formTitle: "Título",
      formTitlePlaceholder: "¿Qué necesitas hacer?",
      formProject: "Proyecto",
      formNoProject: "Sin proyecto (express)",
      formDescription: "Descripción",
      formPriority: "Prioridad",
      formEstimatedMinutes: "Estimación (min)",
      formDueDate: "Fecha de vencimiento",
      formAssignee: "Asignar a",
      formUnassigned: "Sin asignar",
      cancel: "Cancelar",
      create: "Crear Tarea",
      creating: "Creando...",
      priorities: {
        low: "Baja",
        medium: "Media",
        high: "Alta",
        urgent: "Urgente",
      },
    },
    ...overrides,
  };

  return { ...render(<CreateTaskDialog {...props} />), props };
}

describe("CreateTaskDialog (packages/ui)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all unified form fields when open", () => {
    setup();

    expect(screen.getByRole("heading", { name: "Crear Tarea" })).toBeDefined();
    expect(screen.getByLabelText(/Título/)).toBeDefined();
    expect(screen.getByLabelText(/Proyecto/)).toBeDefined();
    expect(screen.getByLabelText(/Descripción/)).toBeDefined();
    expect(screen.getByLabelText(/Prioridad/)).toBeDefined();
    expect(screen.getByLabelText(/Estimación/)).toBeDefined();
    expect(screen.getByLabelText(/Fecha de vencimiento/)).toBeDefined();
    expect(screen.getByLabelText(/Asignar a/)).toBeDefined();
    expect(screen.getByRole("button", { name: "Crear Tarea" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDefined();
  });

  it("submits valid form data including express task when project is omitted", async () => {
    const { props } = setup();

    const titleInput = screen.getByLabelText(/Título/);
    fireEvent.change(titleInput, { target: { value: "Comprar leche" } });

    // Project select default is "" (Sin proyecto express)
    const projectSelect = screen.getByLabelText(/Proyecto/) as HTMLSelectElement;
    expect(projectSelect.value).toBe("");

    const submitBtn = screen.getByRole("button", { name: "Crear Tarea" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(props.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Comprar leche",
          priority: "MEDIUM",
          projectId: undefined,
        })
      );
    });
  });

  it("validates required title and prevents submit when empty", async () => {
    const { props } = setup();

    const submitBtn = screen.getByRole("button", { name: "Crear Tarea" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(props.onSubmit).not.toHaveBeenCalled();
      expect(screen.getByRole("alert")).toBeDefined();
    });
  });

  it("allows selecting priority and changes active state", async () => {
    const { props } = setup();

    fireEvent.change(screen.getByLabelText(/Título/), {
      target: { value: "Tarea Urgente" },
    });

    const urgentBtn = screen.getByRole("radio", { name: "Urgente" });
    fireEvent.click(urgentBtn);
    expect(urgentBtn.getAttribute("aria-checked")).toBe("true");

    const submitBtn = screen.getByRole("button", { name: "Crear Tarea" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(props.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: "URGENT",
        })
      );
    });
  });

  it("hides project dropdown if projectId is fixed by caller", () => {
    setup({ projectId: "proj-1" });

    expect(screen.queryByLabelText(/Proyecto/)).toBeNull();
  });

  it("renders slots for voice/smart parse, AI estimate, recurrence, and custom fields", () => {
    setup({
      titleActions: <button type="button">Voz</button>,
      autoEstimateAction: <button type="button">Auto</button>,
      recurrenceNode: <div data-testid="recurrence-widget">Recurrencia</div>,
      customFieldsNode: <div data-testid="custom-fields-widget">Campos</div>,
    });

    expect(screen.getByRole("button", { name: "Voz" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Auto" })).toBeDefined();
    expect(screen.getByTestId("recurrence-widget")).toBeDefined();
  });
});

// ODD 024 (enmienda L3): prefill de captura desde la extensión de Chrome.
describe("CreateTaskDialog initial values (ODD 024)", () => {
  it("rellena título y descripción con initialTitle/initialDescription", () => {
    setup({ initialTitle: "Página interesante", initialDescription: "https://example.com/articulo" });

    const titleInput = screen.getByPlaceholderText("¿Qué necesitas hacer?") as HTMLInputElement;
    expect(titleInput.value).toBe("Página interesante");

    const descriptionInput = screen.getByPlaceholderText(/add details about this task/i) as HTMLTextAreaElement;
    expect(descriptionInput.value).toBe("https://example.com/articulo");
  });

  it("sin valores iniciales el formulario arranca vacío (regresión)", () => {
    setup();

    const titleInput = screen.getByPlaceholderText("¿Qué necesitas hacer?") as HTMLInputElement;
    expect(titleInput.value).toBe("");
  });
});
