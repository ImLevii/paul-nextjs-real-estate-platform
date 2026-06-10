import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                <Home className="size-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">Haven</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Discover extraordinary places to stay. From cozy cabins to luxury villas, find your perfect getaway.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">All Properties</Link></li>
              <li><Link to="/?type=villa" className="hover:text-foreground transition-colors">Villas</Link></li>
              <li><Link to="/?type=cabin" className="hover:text-foreground transition-colors">Cabins</Link></li>
              <li><Link to="/?type=apartment" className="hover:text-foreground transition-colors">Apartments</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/admin" className="hover:text-foreground transition-colors">Admin Dashboard</Link></li>
              <li><Link to="/admin/listings/new" className="hover:text-foreground transition-colors">List Your Property</Link></li>
              <li><Link to="/admin/bookings" className="hover:text-foreground transition-colors">Manage Bookings</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Haven. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
