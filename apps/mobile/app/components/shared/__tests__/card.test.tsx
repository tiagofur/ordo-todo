import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import Card from '../card.component';
import { useThemeColors } from '@/app/data/hooks/use-theme-colors.hook';

jest.mock('@/app/data/hooks/use-theme-colors.hook', () => ({
  useThemeColors: jest.fn(() => ({
      card: '#FFF',
      cardBorder: '#EEE',
      shadowColor: '#000',
  })),
}));

describe('Card Simple', () => {
  it('renders', () => {
    const { getByText } = render(
      <Card>
        <Text>Hello</Text>
      </Card>
    );
    expect(getByText('Hello')).toBeTruthy();
  });

  it('presses', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Card onPress={onPress}>
        <Text>Click</Text>
      </Card>
    );
    fireEvent.press(getByText('Click'));
    expect(onPress).toHaveBeenCalled();
  });

  it('rerenders', () => {
    const { getByText, rerender } = render(
      <Card variant="primary">
        <Text>A</Text>
      </Card>
    );
    expect(getByText('A')).toBeTruthy();
    rerender(
      <Card variant="error">
        <Text>B</Text>
      </Card>
    );
    expect(getByText('B')).toBeTruthy();
  });
});
