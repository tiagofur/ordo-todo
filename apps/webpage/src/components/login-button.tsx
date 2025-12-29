'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@ordo-todo/ui';
import { LogIn, User, LogOut } from 'lucide-react';

interface LoginButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showUserInfo?: boolean;
}

export function LoginButton({ 
  className = '', 
  variant = 'outline',
  size = 'default',
  showUserInfo = true,
}: LoginButtonProps) {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <span className="h-4 w-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      </Button>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        {showUserInfo && (
          <div className="flex items-center gap-2">
            {user.image ? (
              <img 
                src={user.image} 
                alt={user.name} 
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-[#06B6D4] flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
            {user.subscriptionTier && user.subscriptionTier !== 'FREE' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#F97316] text-white font-medium">
                {user.subscriptionTier}
              </span>
            )}
          </div>
        )}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={logout}
          className={className}
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={login}
      className={className}
    >
      <LogIn className="h-4 w-4 mr-2" />
      Login
    </Button>
  );
}
