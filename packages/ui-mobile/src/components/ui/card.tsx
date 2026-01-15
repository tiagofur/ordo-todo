
import * as React from 'react';
import { View, type ViewStyle } from 'react-native';
import { cardVariants } from '@ordo-todo/ui-shared/utils';
import { cn } from '../../lib/utils';
import type { CardProps } from '@ordo-todo/ui-shared';

export function Card({
  className,
  variant,
  padding,
  clickable,
  selected,
  children,
  style,
  ...props
}: CardProps & React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn(cardVariants({ variant, padding, clickable, selected, className }))}
      style={style as ViewStyle}
      {...props}
    >
      {children}
    </View>
  );
}
