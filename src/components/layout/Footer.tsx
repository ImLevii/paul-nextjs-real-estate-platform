import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[oklch(0.068_0_0)]">
      <div className="container mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="group inline-flex items-center gap-2.5 transition-opacity hover:opacity-80">
              <div className="flex size-8 items-center justify-center rounded-lg bg-foreground">
                <Compass className="size-4 text-background" strokeWidth={2.5} />
              </div>
              <span className="font-serif text-xl tracking-tight text-foreground">Haven</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Discover extraordinary places to stay. From cozy mountain cabins to luxury beachfront villas — find your perfect escape.
            </p>
            <p className="mt-6 text-xs text-muted-foreground/50">
              &copy; {new Date().getFullYear()} Haven. All rights reserved.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Explore</h4>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'All Properties' },
                { to: '/?type=villa', label: 'Villas' },
                { to: '/?type=cabin', label: 'Cabins' },
                { to: '/?type=apartment', label: 'Apartments' },
                { to: '/?type=cottage', label: 'Cottages' },
              ].map(item => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Platform</h4>
            <ul className="space-y-3">
              {[
                { to: '/admin', label: 'Admin Dashboard' },
                { to: '/admin/listings/new', label: 'List Your Property' },
                { to: '/admin/bookings', label: 'Manage Bookings' },
                { to: '/admin/settings', label: 'Settings' },
              ].map(item => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
