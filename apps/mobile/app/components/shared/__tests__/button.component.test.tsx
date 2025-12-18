import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomButton from '../button.component';
import { useThemeColors } from '@/app/data/hooks/use-theme-colors.hook';

// Mock dependencies (Reanimated is now in jest.setup.js)
jest.mock('@/app/data/hooks/use-theme-colors.hook', () => ({
  useThemeColors: jest.fn(),
}));

describe('CustomButton', () => {
  const mockColors = {
    shadowColor: '#000',
    buttonPrimary: '#2563EB',
    buttonPrimaryText: '#FFF',
    secondary: '#EEE',
    error: '#F00',
    success: '#0F0',
    textMuted: '#999',
  };

  beforeEach(() => {
    (useThemeColors as jest.Mock).mockReturnValue(mockColors);
  });

  it('renders correctly with title', () => {
    const { getByText } = render(<CustomButton title="Click Me" />);
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<CustomButton title="Press Me" onPress={onPressMock} />);
    
    fireEvent.press(getByText('Press Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<CustomButton title="Disabled" onPress={onPressMock} disabled />);
    
    fireEvent.press(getByText('Disabled'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('shows ActivityIndicator when isLoading is true', () => {
    const { queryByText } = render(<CustomButton title="Loading" isLoading />);
    expect(queryByText('Loading')).toBeNull();
  });
});
