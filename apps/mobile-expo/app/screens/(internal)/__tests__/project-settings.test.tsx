/**
 * Project Settings Component Tests
 */

import { render } from '@testing-library/react-native';
import ProjectSettingsScreen from '../project-settings';

describe('ProjectSettingsScreen', () => {
  it('should render without crashing', () => {
    render(<ProjectSettingsScreen projectId={"proj-123"} />);
  });

  it('should display project name and description inputs', () => {
    const { getByPlaceholderText } = render(<ProjectSettingsScreen projectId={"proj-123"} />);

    expect(getByPlaceholderText(/nombre del proyecto/)).toBeTruthy();
    expect(getByPlaceholderText(/Describe este proyecto/)).toBeTruthy();
  });

  it('should display color options', () => {
    const { getByText } = render(<ProjectSettingsScreen projectId={"proj-123"} />);

    expect(getByText(/Azul/)).toBeTruthy();
    expect(getByText(/Verde/)).toBeTruthy();
  });

  it('should display priority options', () => {
    const { getByText } = render(<ProjectSettingsScreen projectId={"proj-123"} />);

    expect(getByText(/Baja/)).toBeTruthy();
    expect(getByText(/Media/)).toBeTruthy();
    expect(getByText(/Alta/)).toBeTruthy();
  });

  it('should display permission toggles', () => {
    const { getByText } = render(<ProjectSettingsScreen projectId={"proj-123"} />);

    expect(getByText(/Permitir comentarios/)).toBeTruthy();
    expect(getByText(/Permitir archivos adjuntos/)).toBeTruthy();
    expect(getByText(/Notificar al completar tarea/)).toBeTruthy();
    expect(getByText(/Recordatorio de fecha de vencimiento/)).toBeTruthy();
  });

  it('should display visibility toggle', () => {
    const { getByText } = render(<ProjectSettingsScreen projectId={"proj-123"} />);

    expect(getByText(/Hacer proyecto público/)).toBeTruthy();
  });

  it('should show danger zone', () => {
    const { getByText } = render(<ProjectSettingsScreen projectId={"proj-123"} />);

    expect(getByText(/Zona de peligro/)).toBeTruthy();
    expect(getByText(/Eliminar proyecto/)).toBeTruthy();
    expect(getByText(/Zona de peligro/)).toBeTruthy();
  });

  it('should show save button', () => {
    const { getByText } = render(<ProjectSettingsScreen projectId={"proj-123"} />);

    expect(getByText(/Guardar/)).toBeTruthy();
  });

  it('should disable inputs when no projectId', () => {
    const { getByPlaceholderText, getByText } = render(<ProjectSettingsScreen projectId="" />);
    const saveBtn = getByText(/Guardar/);
    
    expect(saveBtn.parent?.props.disabled).toBeTruthy();
  });
});
