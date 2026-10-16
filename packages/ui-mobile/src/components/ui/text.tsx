
import * as React from 'react';
import { Text as RNText, type TextStyle } from 'react-native';
import { textVariants } from '@ordo-todo/ui-shared/utils';
import { cn } from '../../lib/utils';
import type { TextProps } from '@ordo-todo/ui-shared';

export function Text({
  className,
  variant,
  color,
  weight,
  align,
  truncate,
  numberOfLines,
  children,
  style,
  ...props
}: TextProps & React.ComponentProps<typeof RNText>) {
  return (
    <RNText
      className={cn(textVariants({ variant, color, weight, align, truncate, className }))}
      numberOfLines={numberOfLines ?? (truncate ? 1 : undefined)}
      style={style as TextStyle}
      {...props}
    >
      {children}
    </RNText>
  );
}
