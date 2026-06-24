import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, Tags, PieChart, LogOut, Wallet } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../utils/cn';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'Categories', path: '/categories', icon: Tags },
    { name: 'Budget', path: '/budget', icon: PieChart },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface border-r border-border flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center">
            <Wallet size={18} />
          </div>
          <span className="font-bold text-lg text-text-main tracking-tight">TrackerPro</span>
        </div>
        
        <div className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-text-muted hover:bg-slate-50 hover:text-text-main"
                )}
              >
                <Icon size={20} className={isActive ? "text-primary" : "text-text-muted"} />
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-medium text-text-main">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-text-main truncate">{user?.name || 'User'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:bg-danger/10 hover:text-danger transition-all"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-surface border-b border-border">
          <div className="flex items-center gap-2">
            <Wallet size={24} className="text-primary" />
            <span className="font-bold text-lg">TrackerPro</span>
          </div>
          <button onClick={handleLogout} className="text-text-muted">
            <LogOut size={20} />
          </button>
        </header>

        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
