import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { useTheme } from './theme-provider';

const NAV_LINKS = [
  { to: '/api-calculator', label: 'API Cost' },
  { to: '/vram-calculator', label: 'VRAM Fit' },
  { to: '/directory', label: 'Directory' },
  { to: '/about', label: 'About' },
];

export function SiteHeader() {
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center justify-between gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-7">
          <Logo />
          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'relative flex h-14 items-center px-3 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors',
                    'after:absolute after:inset-x-3 after:bottom-0 after:h-[2px] after:transition-colors',
                    isActive
                      ? 'text-foreground after:bg-accent'
                      : 'text-muted-foreground after:bg-transparent hover:text-foreground',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav aria-label="Mobile" className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-[1240px] flex-col px-4 py-2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[44px] items-center border-b border-border/60 font-mono text-[12px] uppercase tracking-[0.12em] last:border-0',
                    isActive ? 'text-foreground' : 'text-muted-foreground',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-muted/30">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-[34ch] text-[13.5px] leading-[1.65] text-muted-foreground">
              Independent, client-side calculators for LLM API spend and local inference hardware. No accounts, no
              tracking pixels, all math runs in your browser.
            </p>
          </div>

          <FooterColumn
            title="Calculators"
            links={[
              { to: '/api-calculator', label: 'LLM API cost' },
              { to: '/vram-calculator', label: 'VRAM requirements' },
              { to: '/api-calculator/claude-sonnet-vs-gpt-4o-api-cost', label: 'Sonnet vs GPT-4o' },
              { to: '/vram-calculator/llama-3-70b-q4-rtx-4090', label: '70B on RTX 4090' },
            ]}
          />
          <FooterColumn
            title="Resources"
            links={[
              { to: '/directory', label: 'All guides' },
              { to: '/about', label: 'About & method' },
              { to: '/contact', label: 'Contact' },
            ]}
          />
          <FooterColumn
            title="Legal"
            links={[
              { to: '/privacy-policy', label: 'Privacy policy' },
              { to: '/terms-of-service', label: 'Terms of service' },
              { to: '/contact', label: 'Advertising enquiries' },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
            © {new Date().getFullYear()} Modelmath — estimates only, verify with your provider
          </p>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
            List prices — verify with each provider
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h2 className="micro">{title}</h2>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={`${link.to}-${link.label}`}>
            <Link
              to={link.to}
              className="text-[13.5px] leading-[1.5] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
