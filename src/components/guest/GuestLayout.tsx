import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUp, ChevronDown, Globe, Menu, MessageCircle, Moon, ShieldCheck, Sun } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/src/components/ui/sheet';
import { Separator } from '@/src/components/ui/separator';
import { useI18n } from '@/src/context/I18nContext';
import { useAppTheme } from '@/src/context/ThemeContext';
import { track } from '@/src/lib/api';
import { WHATSAPP_URL } from '@/src/data/resortContent';

const PRIMARY_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/stay', label: 'Stay' },
  { to: '/facilities', label: 'Facilities' },
  { to: '/experiences', label: 'Experiences' },
  { to: '/activities', label: 'Activities' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/blog', label: 'Blog' },
];

const MORE_LINKS = [
  { to: '/offers', label: 'Seasonal Offers' },
  { to: '/dining', label: 'Kitchen & Dining' },
  { to: '/around', label: 'Around Skardu' },
  { to: '/events', label: 'Resort Events' },
  { to: '/reviews', label: 'Guest Reviews' },
  { to: '/directions', label: 'Directions & Map' },
  { to: '/virtual-tour', label: 'Virtual Tour' },
  { to: '/faq', label: 'Travel FAQ' },
  { to: '/booking', label: 'Find a Booking' },
  { to: '/login', label: 'Guest Portal' },
  { to: '/circle', label: 'Oasis Circle' },
  { to: '/contact', label: 'Contact Desk' },
];

export function GuestLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { lang, t, toggle } = useI18n();
  const { mode, toggleTheme } = useAppTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const started = Date.now();
    track({ type: 'view', path: pathname });
    return () => {
      track({ type: 'dwell', path: pathname, dwellMs: Date.now() - started });
    };
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const moreActive = MORE_LINKS.some((m) => pathname === m.to || pathname.startsWith(`${m.to}/`));

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* Single-row responsive Top Bar with full portal navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="font-display text-2xl font-semibold tracking-tight text-foreground whitespace-nowrap shrink-0 transition-opacity hover:opacity-80"
          >
            Oasis Resort
          </Link>

          <nav className="hidden lg:flex items-center gap-5 text-[13px] font-medium text-muted-foreground" aria-label="Main navigation">
            {PRIMARY_LINKS.map((item) => {
              const active = pathname === item.to || (item.to === '/stay' && pathname === '/rooms') || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`whitespace-nowrap shrink-0 transition-colors hover:text-foreground underline-offset-8 ${
                    active ? 'text-foreground font-semibold underline decoration-accent decoration-2' : 'hover:underline decoration-border'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`inline-flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors hover:text-foreground cursor-pointer ${
                    moreActive ? 'text-foreground font-semibold' : ''
                  }`}
                >
                  More
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {MORE_LINKS.slice(0, 8).map((item) => (
                  <DropdownMenuItem key={item.to} asChild>
                    <Link to={item.to} className="w-full cursor-pointer">
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {MORE_LINKS.slice(8).map((item) => (
                  <DropdownMenuItem key={item.to} asChild>
                    <Link to={item.to} className="w-full cursor-pointer">
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex whitespace-nowrap">
              <Link to="/order">Order Food</Link>
            </Button>
            <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex whitespace-nowrap">
              <Link to="/book">Book Stay</Link>
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden h-10 w-10" aria-label="Open navigation menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col justify-between overflow-y-auto">
                <div>
                  <SheetHeader>
                    <SheetTitle className="font-display text-2xl font-semibold">Oasis Resort Skardu</SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6 flex flex-col gap-1">
                    <Link
                      to="/"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                    >
                      Home
                    </Link>
                    {[...PRIMARY_LINKS, ...MORE_LINKS, { to: '/order', label: 'Order Food' }, { to: '/book', label: 'Book a Stay' }].map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div className="mt-6 space-y-3 border-t border-border pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <Button variant="outline" size="sm" onClick={toggle} className="flex-1">
                      <Globe className="h-4 w-4" />
                      {t.lang}
                    </Button>
                    <Button variant="outline" size="sm" onClick={toggleTheme} className="flex-1">
                      {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      {mode === 'dark' ? 'Light' : 'Dark'}
                    </Button>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/admin" onClick={() => setMobileOpen(false)}>
                      <ShieldCheck className="h-4 w-4" />
                      Staff & Admin Desk
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-12">{children}</main>

      <footer className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div className="space-y-3">
            <h2 className="font-display text-2xl font-semibold">Oasis Resort Skardu</h2>
            <p className="text-sm leading-relaxed opacity-80">{t.footer}</p>
            <p className="text-xs opacity-70">{t.address}</p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider opacity-60">Stay & Booking</p>
            <ul className="space-y-2 text-sm opacity-90">
              <li><Link to="/rooms" className="hover:underline">Rooms & Huts</Link></li>
              <li><Link to="/book" className="hover:underline">Check Availability</Link></li>
              <li><Link to="/booking" className="hover:underline">Find a Booking</Link></li>
              <li><Link to="/login" className="hover:underline">Guest Stay Portal</Link></li>
              <li><Link to="/order" className="hover:underline">In-Room Dining Order</Link></li>
              <li><Link to="/offers" className="hover:underline">Direct Offers</Link></li>
              <li><Link to="/reviews" className="hover:underline">Guest Reviews</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider opacity-60">The Desert & House</p>
            <ul className="space-y-2 text-sm opacity-90">
              <li><Link to="/about" className="hover:underline">About Oasis</Link></li>
              <li><Link to="/facilities" className="hover:underline">Resort Facilities</Link></li>
              <li><Link to="/activities" className="hover:underline">Activities & Safaris</Link></li>
              <li><Link to="/experiences" className="hover:underline">Experiences</Link></li>
              <li><Link to="/gallery" className="hover:underline">Photo Gallery</Link></li>
              <li><Link to="/dining" className="hover:underline">Kitchen & Dining</Link></li>
              <li><Link to="/blog" className="hover:underline">Journal & Blog</Link></li>
              <li><Link to="/around" className="hover:underline">Around Skardu</Link></li>
              <li><Link to="/faq" className="hover:underline">Travel FAQ</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider opacity-60">Front Desk</p>
              <p className="text-sm tabular-nums opacity-90">0308-1472888 · 0344-5537788 · 0355-4114567</p>
              <p className="mt-1 text-sm opacity-80">
                <a href="mailto:oasisresortskardu@gmail.com" className="hover:underline">oasisresortskardu@gmail.com</a>
              </p>
              <p className="mt-2 text-sm">
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="font-medium text-accent hover:underline">
                  Message Desk on WhatsApp →
                </a>
              </p>
            </div>

            <Separator className="bg-white/15" />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggle}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 text-xs font-medium hover:bg-white/10 cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5" />
                {t.lang}
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 text-xs font-medium hover:bg-white/10 cursor-pointer"
              >
                {mode === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 text-xs font-medium hover:bg-white/10"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Staff Portal
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 text-xs opacity-70 sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} Oasis Resort Skardu. Katpana Cold Desert.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/legal/privacy" className="hover:underline">Privacy</Link>
              <Link to="/legal/terms" className="hover:underline">Terms</Link>
              <Link to="/legal/cancellation" className="hover:underline">Cancellation</Link>
              <Link to="/legal/refund" className="hover:underline">Refund Policy</Link>
              <Link to="/legal/cookies" className="hover:underline">Cookies</Link>
              <Link to="/sitemap" className="hover:underline">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Desktop quick actions */}
      {scrolled && (
        <button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 left-6 z-30 hidden h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md hover:bg-secondary md:flex cursor-pointer"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-30 hidden items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700 md:inline-flex"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </a>

      {/* Compact mobile bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-border bg-card/95 px-3 py-2 backdrop-blur md:hidden">
        <Button asChild variant="accent" size="sm" className="flex-1">
          <Link to="/book">Book Stay</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to="/order">Order Food</Link>
        </Button>
        <Button asChild variant="secondary" size="sm" className="px-3">
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
