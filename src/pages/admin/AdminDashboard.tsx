import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, CalendarDays, DollarSign, TrendingUp, ArrowUpRight, ArrowRight, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { supabase, type Property, type Booking } from '@/lib/supabase'
import { BOOKING_STATUSES } from '@/lib/constants'
import { format, parseISO } from 'date-fns'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

const chartConfig = {
  revenue: { label: 'Revenue', color: 'var(--color-gold)' },
  bookings: { label: 'Bookings', color: 'var(--chart-2)' },
}

const revenueData = [
  { month: 'Jan', revenue: 4200, bookings: 12 },
  { month: 'Feb', revenue: 5800, bookings: 18 },
  { month: 'Mar', revenue: 7200, bookings: 22 },
  { month: 'Apr', revenue: 6500, bookings: 20 },
  { month: 'May', revenue: 9100, bookings: 28 },
  { month: 'Jun', revenue: 11400, bookings: 35 },
]

export function AdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [{ data: props }, { data: books }] = await Promise.all([
      supabase.from('properties').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(50),
    ])
    setProperties(props || [])
    setBookings(books || [])
    setLoading(false)
  }

  const activeProperties = properties.filter(p => p.is_active).length
  const pendingBookings = bookings.filter(b => b.status === 'pending').length
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length
  const totalRevenue = bookings
    .filter(b => b.payment_status === 'paid' || b.payment_status === 'authorized')
    .reduce((sum, b) => sum + b.total_price, 0)
  const recentBookings = bookings.slice(0, 5)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl bg-white/5" />)}
        </div>
        <Skeleton className="h-64 rounded-xl bg-white/5" />
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Listings',
      value: properties.length,
      sub: `${activeProperties} active`,
      icon: Building2,
      trend: null,
    },
    {
      label: 'Total Bookings',
      value: bookings.length,
      sub: `${pendingBookings} pending · ${confirmedBookings} confirmed`,
      icon: CalendarDays,
      trend: null,
    },
    {
      label: 'Revenue',
      value: `$${totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      sub: '+12% this month',
      icon: DollarSign,
      trend: 'up',
    },
    {
      label: 'Avg Rating',
      value: properties.length > 0
        ? (properties.reduce((s, p) => s + (p.rating_avg || 0), 0) /
            (properties.filter(p => p.rating_avg > 0).length || 1)).toFixed(2)
        : '—',
      sub: 'Across all properties',
      icon: Star,
      trend: null,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-2xl font-normal text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 stagger-children">
        {stats.map(stat => (
          <Card key={stat.label} className="border-white/8 bg-card hover-lift transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{stat.label}</CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg bg-white/6">
                <stat.icon className="size-3.5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className={`mt-1 flex items-center gap-1 text-xs ${
                stat.trend === 'up' ? 'text-emerald-400' : 'text-muted-foreground'
              }`}>
                {stat.trend === 'up' && <ArrowUpRight className="size-3" />}
                {stat.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Revenue Chart */}
        <Card className="border-white/8 bg-card lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">Revenue Overview</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Monthly revenue for 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-48 w-full">
              <BarChart data={revenueData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'oklch(0.50 0 0)' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'oklch(0.50 0 0)' }} tickFormatter={v => `$${v / 1000}k`} />
                <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'oklch(1 0 0 / 4%)' }} />
                <Bar dataKey="revenue" fill="var(--color-gold)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Properties */}
        <Card className="border-white/8 bg-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">Top Properties</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">By rating</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground hover:text-foreground">
              <Link to="/admin/listings">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {properties
                .filter(p => p.rating_avg > 0)
                .sort((a, b) => b.rating_avg - a.rating_avg)
                .slice(0, 5)
                .map(p => (
                  <div key={p.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.city}, {p.state}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 text-sm">
                      <Star className="size-3 fill-gold text-gold" />
                      <span className="font-medium text-foreground">{p.rating_avg.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              {properties.filter(p => p.rating_avg > 0).length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">No ratings yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="border-white/8 bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">Recent Bookings</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Latest reservation activity</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Link to="/admin/bookings">View all <ArrowRight className="size-3.5" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No bookings yet.{' '}
              <Link to="/admin/listings" className="text-foreground underline-offset-4 hover:underline">
                Add a listing
              </Link>{' '}
              to get started.
            </div>
          ) : (
            <div>
              {recentBookings.map((booking, i) => {
                const status = BOOKING_STATUSES[booking.status]
                return (
                  <div key={booking.id}>
                    {i > 0 && <Separator className="bg-white/6" />}
                    <div className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {booking.guest_name || booking.guest_email || 'Guest'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(booking.check_in), 'MMM d')} – {format(parseISO(booking.check_out), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <Badge className={`text-xs ${status?.color}`}>{status?.label}</Badge>
                        <p className="mt-1 text-sm font-semibold text-foreground">${booking.total_price.toFixed(0)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          {
            to: '/admin/listings/new',
            icon: Building2,
            label: 'Add Listing',
            sub: 'Create a new property',
          },
          {
            to: '/admin/bookings',
            icon: CalendarDays,
            label: 'Manage Bookings',
            sub: `${pendingBookings} pending requests`,
          },
          {
            to: '/',
            icon: TrendingUp,
            label: 'View Site',
            sub: 'Preview public listings',
          },
        ].map(action => (
          <Button
            key={action.to}
            variant="outline"
            className="h-auto justify-start gap-3 border-white/8 bg-white/4 p-4 text-left transition-all duration-200 hover:bg-white/8 hover:border-white/15"
            asChild
          >
            <Link to={action.to}>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/8">
                <action.icon className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.sub}</p>
              </div>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}
