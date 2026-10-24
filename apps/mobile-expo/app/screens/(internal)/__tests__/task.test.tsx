/**
 * Task screen tests: shared-text draft + NL prefill (mobile, S6)
 */

import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import TaskScreen from "../task";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";

jest.mock("@/app/data/hooks/use-theme-colors.hook", () => ({
  useThemeColors: jest.fn(),
}));

jest.mock("@/app/lib/shared-hooks", () => ({
  useCreateTask: () => ({ mutateAsync: mockMutateAsync }),
  useUpdateTask: () => ({ mutateAsync: jest.fn() }),
  useTask: () => ({ data: undefined }),
  useWorkspaces: () => ({ data: [] }),
  useProjects: () => ({ data: mockProjects }),
}));

jest.mock("@ordo-todo/stores", () => ({
  useWorkspaceStore: () => ({ selectedWorkspaceId: "ws-1" }),
}));

jest.mock("@/app/lib/hooks/use-parse-task.hook", () => ({
  useParseTask: () => ({
    parsed: mockParseState.parsed,
    isParsing: false,
    needsConfirmation: mockParseState.parsed?.needsConfirmation ?? false,
  }),
}));

jest.mock("../../components/task/custom-field-inputs", () => ({
  useCustomFieldForm: () => ({
    getValuesForSubmit: () => [],
    saveValues: jest.fn(),
  }),
  CustomFieldInputs: () => null,
}));

jest.mock("../subtask-section", () => ({
  SubtaskSection: () => null,
}));

jest.mock("../../components/task/recurrence-selector", () => ({
  RecurrenceSelector: () => null,
}));

jest.mock("../../components/task/task-dependency-selector", () => ({
  TaskDependencySelector: () => null,
}));

jest.mock("@react-native-community/datetimepicker", () => ({
  __esModule: true,
  default: () => null,
}));

const mockMutateAsync = jest.fn();

const mockProjects = [
  { id: "proj-1", name: "Work", slug: "work" },
  { id: "proj-2", name: "Personal", slug: "personal" },
];

interface MockParsed {
  title: string;
  dueAt?: string;
  priority?: string;
  projectHint?: string;
  needsConfirmation?: boolean;
}

const mockParseState: { parsed: MockParsed | null } = { parsed: null };

const mockColors = {
  background: "#fff",
  card: "#f5f5f5",
  text: "#111",
  textMuted: "#999",
  textSecondary: "#666",
  border: "#ddd",
  primary: "#2563EB",
};

function setParams(params: Record<string, string>) {
  (useLocalSearchParams as jest.Mock).mockReturnValue(params);
}

describe("TaskScreen shared draft + NL (S6)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useThemeColors as jest.Mock).mockReturnValue(mockColors);
    mockParseState.parsed = null;
    setParams({});
  });

  it("pre-fills the title from the ?text= draft param", () => {
    setParams({ text: "comprar leche mañana" });

    const { getByPlaceholderText, getByDisplayValue } = render(
      <TaskScreen />,
    );

    expect(getByPlaceholderText("¿Qué necesitas hacer?")).toBeTruthy();
    expect(getByDisplayValue("comprar leche mañana")).toBeTruthy();
  });

  it("shows NL preview chips for the parsed draft", async () => {
    setParams({ text: "informe viernes" });
    mockParseState.parsed = {
      title: "informe",
      dueAt: "2026-10-23T09:00:00.000Z",
      priority: "HIGH",
      projectHint: "personal",
    };

    const { getByText } = render(<TaskScreen />);

    await waitFor(() => {
      expect(getByText("10/23/2026")).toBeTruthy();
      expect(getByText("HIGH")).toBeTruthy();
      expect(getByText("#personal")).toBeTruthy();
    });
  });

  it("resolves the project from the #hint on submit", async () => {
    setParams({ text: "comprar leche #personal" });
    mockParseState.parsed = {
      title: "comprar leche",
      projectHint: "personal",
      priority: "MEDIUM",
    };
    mockMutateAsync.mockResolvedValue({ id: "task-1" });

    const { getByText } = render(<TaskScreen />);

    fireEvent.press(getByText("Crear Tarea"));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: "proj-2" }),
      );
    });
  });

  it("falls back to the first project without a hint", async () => {
    mockParseState.parsed = {
      title: "llamar",
      priority: "MEDIUM",
    };
    mockMutateAsync.mockResolvedValue({ id: "task-1" });

    const { getByPlaceholderText, getByText } = render(<TaskScreen />);

    fireEvent.changeText(
      getByPlaceholderText("¿Qué necesitas hacer?"),
      "llamar",
    );
    fireEvent.press(getByText("Crear Tarea"));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: "proj-1" }),
      );
    });
  });
});
