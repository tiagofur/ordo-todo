
import * as React from 'react';
import { Pressable, Text, ActivityIndicator, type ViewStyle } from 'react-native';
import { buttonVariants } from '@ordo-todo/ui-shared/utils';
import { cn } from '../../lib/utils';
import type { ButtonProps } from '@ordo-todo/ui-shared';

export function Button({
  className,
  variant,
  size,
  fullWidth,
  children,
  title,
  iconLeft,
  iconRight,
  loading,
  disabled,
  style,
  onPress,
  ...props
}: ButtonProps) {
  // Extract text color based on variant for ActivityIndicator
  const getSpinnerColor = () => {
    if (variant === 'ghost' || variant === 'secondary') return '#9CA3AF'; // gray-400
    return '#FFFFFF';
  };

  return (
    <Pressable
      className={cn(
        buttonVariants({ variant, size, fullWidth, className }),
        disabled && 'opacity-50',
        'flex-row gap-2' // NativeWind gap support
      )}
      disabled={disabled || loading}
      onPress={onPress}
      style={style as ViewStyle}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getSpinnerColor()} size="small" />
      ) : (
        <>
          {iconLeft}
          {title ? (
             <Text className={cn(
               'font-medium text-center',
               variant === 'ghost' ? 'text-gray-300' : 'text-white',
               size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : 'text-base'
             )}>
               {title}
             </Text>
          ) : (
            children
          )}
          {iconRight}
        </>
      )}
    </Pressable>
  );
}
