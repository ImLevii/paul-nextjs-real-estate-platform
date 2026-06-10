import { Outlet, NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard, Compass, Building2, CalendarDays, Settings,
  ChevronLeft, Bell, Search
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ModeToggle } from '@/components/mode-toggle'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/listings', label: 'Listings', icon: Building2 },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminLayout() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-white/8 bg-sidebar">
        <SidebarHeader className="border-b border-white/8">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link to="/" className="flex items-center gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground">
                    <Compass className="size-4 text-background" strokeWidth={2.5} />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-foreground">Haven Admin</span>
                    <span className="truncate text-xs text-muted-foreground">Property Management</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map(item => (
                  <SidebarMenuItem key={item.to}>
                    <NavLink to={item.to} end={item.end}>
                      {({ isActive }) => (
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={item.label}
                          className={
                            isActive
                              ? 'bg-white/10 text-foreground font-medium'
                              : 'text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors duration-150'
                          }
                        >
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-white/8">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                <Link to="/" className="flex items-center gap-2">
                  <ChevronLeft className="size-4" />
                  <span>Back to Site</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="hover:bg-white/5 transition-colors">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="bg-white/10 text-foreground text-xs font-semibold">AD</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-foreground">Admin User</span>
                  <span className="truncate text-xs text-muted-foreground">admin@haven.com</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-background">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/8 bg-background/80 backdrop-blur-xl px-4">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
          <div className="flex flex-1 items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" disabled>
              <Search className="size-4" />
              <span className="hidden md:inline text-sm">Search...</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-gold" />
            </Button>
            <ModeToggle />
          </div>
        </header>

        {/* Page content */}
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 animate-fade-in">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
