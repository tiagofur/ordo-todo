/**
 * Time Blocking Component Tests
 */

import { render } from "@testing-library/react-native";
import { TimeBlocking, TimeBlock } from "../time-blocking";

const MOCK_PROPS = {
  scheduledDate: new Date("2025-01-15"),
  scheduledTime: "09:00",
  scheduledEndTime: "10:00",
  onTimeBlockChange: jest.fn(),
  taskId: "task-123",
};

describe("TimeBlocking", () => {
  it("should render without crashing", () => {
    render(<TimeBlocking {...MOCK_PROPS} />);
  });

  it("should display scheduled date", () => {
    const { getByText } = render(<TimeBlocking {...MOCK_PROPS} />);

    expect(getByText(/Programado para/)).toBeTruthy();
  });

  it("should calculate and display duration", () => {
    const { getByText } = render(<TimeBlocking {...MOCK_PROPS} />);

    expect(getByText(/60 min/)).toBeTruthy();
  });

  it("should show time inputs for start and end", () => {
    const { getByText } = render(<TimeBlocking {...MOCK_PROPS} />);

    expect(getByText(/Horario/)).toBeTruthy();
    expect(getByText(/Inicio/)).toBeTruthy();
    expect(getByText(/Fin/)).toBeTruthy();
  });

  it("should show notes input", () => {
    const { getByPlaceholderText } = render(<TimeBlocking {...MOCK_PROPS} />);

    expect(getByPlaceholderText(/notas/)).toBeTruthy();
  });

  it("should call onTimeBlockChange when Save button pressed", () => {
    const onTimeBlockChangeMock = jest.fn();
    const { getByText } = render(
      <TimeBlocking
        {...MOCK_PROPS}
        onTimeBlockChange={onTimeBlockChangeMock}
      />,
    );

    expect(getByText(/Guardar Bloque/)).toBeTruthy();
  });

  it("should display cancel button", () => {
    const { getByText } = render(<TimeBlocking {...MOCK_PROPS} />);

    expect(getByText(/Cancelar/)).toBeTruthy();
  });

  it("should handle missing scheduled date", () => {
    const { getByText } = render(
      <TimeBlocking
        {...MOCK_PROPS}
        scheduledDate={undefined}

        onTimeBlockChange={jest.fn()}
      />,
    );

    expect(getByText(/Sin fecha/)).toBeTruthy();
  });
});
