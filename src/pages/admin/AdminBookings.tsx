import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, CalendarDays, ArrowRight, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase, type Booking, type Property } from '@/lib/supabase'
import { BOOKING_STATUSES, PAYMENT_STATUSES } from '@/lib/constants'
import { format, parseISO } from 'date-fns'

type BookingWithProperty = Booking & { property?: Property }

export function AdminBookings() {
  const [bookings, setBookings] = useState<BookingWithProperty[]>([])
  const [_properties, setProperties] = useState<Map<string, Property>>(new Map())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [{ data: books }, { data: props }] = await Promise.all([
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('properties').select('id, title, city, state, property_type'),
    ])

    const propMap = new Map<string, Property>()
    props?.forEach(p => propMap.set(p.id, p as Property))
    setProperties(propMap)

    const enriched = (books || []).map(b => ({
      ...b,
      property: propMap.get(b.property_id),
    }))
    setBookings(enriched)
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    if (!error) {
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: status as Booking['status'] } : b))
    }
  }

  const filtered = bookings.filter(b => {
    const matchSearch = !search ||
      (b.guest_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.guest_email || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.property?.title || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    revenue: bookings
      .filter(b => b.payment_status === 'paid' || b.payment_status === 'authorized')
      .reduce((s, b) => s + b.total_price, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-normal text-foreground">Bookings</h1>
          <p className="text-sm text-muted-foreground">{bookings.length} total reservations</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-400' },
          { label: 'Confirmed', value: stats.confirmed, color: 'text-emerald-400' },
          { label: 'Revenue', value: `$${stats.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, color: 'text-gold' },
        ].map(s => (
          <Card key={s.label} className="border-white/8 bg-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by guest name, email, or property..."
            className="border-white/10 bg-white/5 pl-9 text-foreground placeholder:text-muted-foreground focus-visible:ring-white/20"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full border-white/10 bg-white/5 sm:w-44">
            <Filter className="size-4 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(BOOKING_STATUSES).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl bg-white/5" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-white/8 bg-card">
          <CardContent className="py-16 text-center">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-white/6 mb-4">
              <CalendarDays className="size-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">No bookings found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Bookings will appear here once guests start reserving'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 stagger-children">
          {filtered.map(booking => {
            const status = BOOKING_STATUSES[booking.status]
            const payStatus = PAYMENT_STATUSES[booking.payment_status]
            return (
              <Card key={booking.id} className="border-white/8 bg-card transition-all duration-200 hover:border-white/15">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">{booking.guest_name || booking.guest_email || 'Guest'}</h3>
                        <Badge className={`text-xs ${status?.color}`}>{status?.label}</Badge>
                        <Badge variant="outline" className={`text-xs ${payStatus?.color}`}>{payStatus?.label}</Badge>
                        <Badge variant="outline" className="text-xs capitalize border-white/12">{booking.payment_method}</Badge>
                      </div>
                      {booking.guest_email && (
                        <p className="text-sm text-muted-foreground">{booking.guest_email}</p>
                      )}
                      {booking.property && (
                        <p className="text-sm font-medium text-foreground">{booking.property.title} · {booking.property.city}, {booking.property.state}</p>
                      )}
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="size-3.5" />
                          {format(parseISO(booking.check_in), 'MMM d')} – {format(parseISO(booking.check_out), 'MMM d, yyyy')}
                        </span>
                        <span>{booking.nights} night{booking.nights !== 1 ? 's' : ''}</span>
                        <span>{booking.guests_count} guest{booking.guests_count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">${booking.total_price.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">total</p>
                      </div>
                      <div className="flex gap-1">
                        {booking.status === 'pending' && (
                          <>
                            <Button size="xs" className="bg-foreground text-background hover:bg-foreground/90" onClick={() => updateStatus(booking.id, 'confirmed')}>Confirm</Button>
                            <Button size="xs" variant="outline" className="border-white/12 text-muted-foreground hover:text-foreground" onClick={() => updateStatus(booking.id, 'cancelled')}>Decline</Button>
                          </>
                        )}
                        <Button size="xs" variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
                          <Link to={`/admin/bookings/${booking.id}`}>
                            Details <ArrowRight className="size-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
