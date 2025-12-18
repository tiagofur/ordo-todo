import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomTextInput from '../text-input.component';
import { useThemeColors } from '@/app/data/hooks/use-theme-colors.hook';

jest.mock('@/app/data/hooks/use-theme-colors.hook', () => ({
  useThemeColors: jest.fn(() => ({
      input: '#FFF',
      inputBorder: '#EEE',
      inputFocused: '#2563EB',
      text: '#000',
      textSecondary: '#666',
      error: '#F00',
      shadowColor: '#000',
      inputPlaceholder: '#999',
  })),
}));

describe('CustomTextInput', () => {
  it('renders correctly with label', () => {
    const { getByText, getByPlaceholderText } = render(
      <CustomTextInput 
        label="Username" 
        value="" 
        onChangeText={() => {}} 
        placeholder="Enter username"
      />
    );
    expect(getByText('Username')).toBeTruthy();
    expect(getByPlaceholderText('Enter username')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeTextMock = jest.fn();
    const { getByPlaceholderText } = render(
      <CustomTextInput 
        value="" 
        onChangeText={onChangeTextMock} 
        placeholder="Type here"
      />
    );
    
    fireEvent.changeText(getByPlaceholderText('Type here'), 'new text');
    expect(onChangeTextMock).toHaveBeenCalledWith('new text');
  });

  it('shows error message', () => {
    const { getByText } = render(
      <CustomTextInput 
        value="" 
        onChangeText={() => {}} 
        error="Field required"
      />
    );
    expect(getByText('Field required')).toBeTruthy();
  });
});
