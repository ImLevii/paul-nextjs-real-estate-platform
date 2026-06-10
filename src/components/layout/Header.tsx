import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navLinks = [
    { to: '/', label: 'Browse' },
    { to: '/admin', label: 'Dashboard' },
  ]

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'glass border-b border-white/8 shadow-[0_8px_32px_oklch(0_0_0/30%)]'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-80"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-foreground transition-transform duration-200 group-hover:scale-105">
            <Compass className="size-4 text-background" strokeWidth={2.5} />
          </div>
          <span className="font-serif text-xl tracking-tight text-foreground">Haven</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(link => {
            const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to))
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-md
                  ${isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-foreground" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button
            variant="outline"
            size="sm"
            asChild
            className="hidden border-white/12 bg-white/5 text-foreground backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:border-white/20 md:flex"
          >
            <Link to="/admin/listings/new">
              List Property
            </Link>
          </Button>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-foreground hover:bg-white/8">
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-white/8 bg-[oklch(0.068_0_0)] p-0">
              <SheetHeader className="border-b border-white/8 px-6 py-5">
                <SheetTitle className="flex items-center gap-2.5 text-left">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-foreground">
                    <Compass className="size-3.5 text-background" strokeWidth={2.5} />
                  </div>
                  <span className="font-serif text-lg text-foreground">Haven</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col px-3 py-4">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-4 border-t border-white/8 pt-4">
                  <Link
                    to="/admin/listings/new"
                    onClick={() => setOpen(false)}
                    className="flex items-center rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white/5"
                  >
                    List your property
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
