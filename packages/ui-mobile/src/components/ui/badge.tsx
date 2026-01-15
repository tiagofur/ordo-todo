
import * as React from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import { badgeVariants } from '@ordo-todo/ui-shared/utils';
import { cn } from '../../lib/utils';
import type { BadgeProps } from '@ordo-todo/ui-shared';

export function Badge({
  className,
  variant,
  size,
  pill,
  children,
  style,
  ...props
}: BadgeProps & React.ComponentProps<typeof View>) {
  // Extract text-related classes from variants to apply to Text component
  // This is a simplification; ideally we separate container and text styles better
  const variantClasses = badgeVariants({ variant, size, pill, className });
  
  return (
    <View
      className={cn(variantClasses, 'flex-row items-center self-start')}
      style={style as ViewStyle}
      {...props}
    >
      <Text className={cn(
        'font-medium text-center',
        variant === 'default' ? 'text-gray-300' :
        variant === 'primary' ? 'text-cyan-400' :
        variant === 'secondary' ? 'text-purple-400' :
        variant === 'success' ? 'text-green-400' :
        variant === 'warning' ? 'text-yellow-400' :
        variant === 'danger' ? 'text-red-400' : 'text-gray-100',
        size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
      )}>
        {children}
      </Text>
    </View>
  );
}
