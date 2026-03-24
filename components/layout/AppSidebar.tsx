'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/scan?mode=general', label: 'General scan' },
  { href: '/scan?mode=job_match', label: 'Job scan' },
]

export function AppSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function isActive(href: string): boolean {
    if (href.startsWith('/dashboard')) return pathname === '/dashboard'
    if (!href.startsWith('/scan')) return pathname === href

    if (pathname !== '/scan') return false

    const targetMode = href.includes('job_match') ? 'job_match' : 'general'
    const currentMode = searchParams.get('mode') ?? 'general'
    return currentMode === targetMode
  }

  return (
    <aside className="w-64 border-r border-border bg-bg-surface px-4 py-5 flex flex-col min-h-screen">
      <div className="mb-8 px-2">
        <p className="text-text-primary text-sm font-medium">Screend</p>
        <p className="text-text-tertiary text-xs font-mono mt-1">Resume workspace</p>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-element px-3 py-2 text-sm transition-colors"
            style={
              isActive(item.href)
                ? {
                    background: 'var(--color-accent-muted)',
                    border: '0.5px solid var(--color-accent-dim)',
                    color: 'var(--color-accent)',
                  }
                : {
                    color: 'var(--color-text-secondary)',
                  }
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t border-border pt-4 px-2">
        <p className="text-text-tertiary text-xs font-mono mb-2">Profile</p>
        <div className="flex items-center gap-2">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: {
                  width: '2rem',
                  height: '2rem',
                },
              },
            }}
            afterSignOutUrl="/"
          />
          <span className="text-text-secondary text-sm">Account</span>
        </div>
      </div>
    </aside>
  )
}
