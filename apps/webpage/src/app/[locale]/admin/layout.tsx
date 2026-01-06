'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from '@/i18n/routing';
import { useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { Button } from '@ordo-todo/ui';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut,
  Map,
  MessageSquare
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, login, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      // If authenticating, we might want to redirect or show login
      // login(); 
    }
  }, [isLoading, user, login]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#06B6D4] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          You need to be logged in to access the administration panel.
        </p>
        <Button onClick={login} size="lg" className="bg-[#06B6D4] text-white hover:bg-[#0891B2]">
          Login to Continue
        </Button>
      </div>
    );
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: FileText, label: 'Blog Posts', href: '/admin/blog' },
    { icon: Map, label: 'Roadmap', href: '/admin/roadmap' },
    { icon: MessageSquare, label: 'Feedback', href: '/admin/feedback' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen flex bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r hidden md:flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#06B6D4] flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="font-bold text-lg">Admin Panel</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
               {user.image ? (
                 <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
               ) : (
                 <span className="font-bold text-xs">{user.name?.[0]}</span>
               )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container py-8 px-4 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
