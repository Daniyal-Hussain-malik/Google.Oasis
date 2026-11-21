import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  BedDouble,
  BookOpen,
  Building2,
  ChefHat,
  ClipboardList,
  CreditCard,
  ExternalLink,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Receipt,
  Settings,
  Star,
  Sun,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/src/components/ui/sheet';
import { FLOOR, FRONT, ROLE_LABELS, StaffRole, SUPER, useAdminAuth } from '@/src/context/AdminAuthContext';
import { useAppTheme } from '@/src/context/ThemeContext';
import { cn } from '@/src/lib/utils';

interface NavItem {
  to: string;
  label: string;
  roles: StaffRole[];
  icon: React.ReactNode;
  end?: boolean;
}

const NAV_GROUPS: Array<{ group: string; links: NavItem[] }> = [
  {
    group: 'Operations',
    links: [
      { to: '/admin', label: 'Dashboard', roles: FRONT, icon: <LayoutDashboard className="h-4 w-4" />, end: true },
      { to: '/admin/reservations', label: 'Reservations', roles: FRONT, icon: <ClipboardList className="h-4 w-4" /> },
      { to: '/admin/payment-proofs', label: 'Payment Proofs', roles: FRONT, icon: <CreditCard className="h-4 w-4" /> },
      { to: '/admin/enquiries', label: 'Enquiries', roles: FRONT, icon: <MessageSquare className="h-4 w-4" /> },
      { to: '/admin/feedback', label: 'Guest Feedback', roles: FRONT, icon: <Star className="h-4 w-4" /> },
    ],
  },
  {
    group: 'Restaurant',
    links: [
      { to: '/admin/restaurant', label: 'Overview', roles: FRONT, icon: <UtensilsCrossed className="h-4 w-4" />, end: true },
      { to: '/admin/restaurant/pos', label: 'POS / New Order', roles: FRONT, icon: <Receipt className="h-4 w-4" /> },
      { to: '/admin/restaurant/orders', label: 'All Orders', roles: FRONT, icon: <FileText className="h-4 w-4" /> },
      { to: '/admin/restaurant/kots', label: 'KOT Tickets', roles: FLOOR, icon: <ClipboardList className="h-4 w-4" /> },
      { to: '/admin/restaurant/kitchen', label: 'Kitchen Display', roles: FLOOR, icon: <ChefHat className="h-4 w-4" /> },
      { to: '/admin/restaurant/menu', label: 'Menu Management', roles: FRONT, icon: <BookOpen className="h-4 w-4" /> },
      { to: '/admin/restaurant/categories', label: 'Categories', roles: FRONT, icon: <UtensilsCrossed className="h-4 w-4" /> },
      { to: '/admin/restaurant/payments', label: 'Payments', roles: FRONT, icon: <CreditCard className="h-4 w-4" /> },
      { to: '/admin/restaurant/reports', label: 'Reports', roles: SUPER, icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
  {
    group: 'Property',
    links: [
      { to: '/admin/room-types', label: 'Room Types', roles: FRONT, icon: <Building2 className="h-4 w-4" /> },
      { to: '/admin/rooms', label: 'Rooms Inventory', roles: FRONT, icon: <BedDouble className="h-4 w-4" /> },
    ],
  },
  {
    group: 'Website & Content',
    links: [
      { to: '/admin/blog', label: 'Journal & Blog', roles: SUPER, icon: <BookOpen className="h-4 w-4" /> },
      { to: '/admin/site', label: 'Content & Settings', roles: SUPER, icon: <Settings className="h-4 w-4" /> },
      { to: '/admin/insights', label: 'Web Insights', roles: SUPER, icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
  {
    group: 'System',
    links: [{ to: '/admin/users', label: 'Staff Accounts', roles: SUPER, icon: <Users className="h-4 w-4" /> }],
  },
];

export function AdminLayout({ children, title = 'Operations' }: { children: React.ReactNode; title?: string }) {
  const { user, logout, can } = useAdminAuth();
  const { mode, toggleTheme } = useAppTheme();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isWide = ['/admin/restaurant/pos', '/admin/restaurant/kitchen'].includes(pathname);

  const SidebarBody = (
    <div className="flex h-full flex-col justify-between bg-primary text-primary-foreground">
      <div className="flex flex-col min-h-0 flex-1">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <Link to="/admin" className="font-display text-xl font-semibold tracking-tight text-white">
            Oasis Resort
          </Link>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((section) => {
            const visible = section.links.filter((l) => can(...l.roles));
            if (!visible.length) return null;
            return (
              <div key={section.group}>
                <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/45">
                  {section.group}
                </p>
                <div className="space-y-0.5">
                  {visible.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.end}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-accent text-white'
                            : 'text-white/75 hover:bg-white/10 hover:text-white',
                        )
                      }
                    >
                      {link.icon}
                      <span className="truncate">{link.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-4 space-y-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
          <p className="text-xs text-white/60">{user ? ROLE_LABELS[user.role] || user.role : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10">
            <Link to="/">
              <Home className="h-3.5 w-3.5" />
              Website
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={logout}
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border md:block">
        {SidebarBody}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-card px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden h-9 w-9" aria-label="Menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 border-r-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Admin Navigation</SheetTitle>
                </SheetHeader>
                {SidebarBody}
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2 text-sm truncate">
              <span className="text-muted-foreground hidden sm:inline">Oasis Staff Desk</span>
              <span className="text-muted-foreground hidden sm:inline">/</span>
              <span className="font-semibold text-foreground truncate">{title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
              {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="hidden sm:inline">{mode === 'dark' ? 'Light' : 'Dark'}</span>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/" target="_blank">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Public Site</span>
              </Link>
            </Button>
          </div>
        </header>

        <main className={cn('flex-1', isWide ? 'p-4 md:p-6' : 'mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8')}>
          {children}
        </main>
      </div>
    </div>
  );
}
