import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, Star, Bed, Bath, Users, Check, Clock, CalendarDays, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { supabase, type Property } from '@/lib/supabase'
import { getPropertyImage } from '@/lib/constants'
import { addDays, differenceInDays, format, isBefore, startOfDay } from 'date-fns'
import type { DateRange } from 'react-day-picker'

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState('1')
  const [bookedDates, setBookedDates] = useState<Date[]>([])

  const photos = [
    getPropertyImage(property?.property_type || 'apartment', 0),
    getPropertyImage(property?.property_type || 'apartment', 1),
    getPropertyImage(property?.property_type || 'apartment', 2),
  ]

  useEffect(() => {
    if (id) {
      loadProperty(id)
      loadBookedDates(id)
    }
  }, [id])

  async function loadProperty(propertyId: string) {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .maybeSingle()
    setProperty(data)
    setLoading(false)
  }

  async function loadBookedDates(propertyId: string) {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('check_in, check_out')
      .eq('property_id', propertyId)
      .in('status', ['confirmed', 'pending'])

    if (bookings) {
      const dates: Date[] = []
      bookings.forEach(b => {
        let d = new Date(b.check_in)
        const end = new Date(b.check_out)
        while (isBefore(d, end)) {
          dates.push(new Date(d))
          d = addDays(d, 1)
        }
      })
      setBookedDates(dates)
    }
  }

  const nights = dateRange?.from && dateRange?.to
    ? differenceInDays(dateRange.to, dateRange.from)
    : 0

  const baseCost = property ? nights * property.price_per_night : 0
  const cleaningFee = property?.cleaning_fee || 0
  const serviceFee = property ? baseCost * (property.service_fee_percent / 100) : 0
  const totalCost = baseCost + cleaningFee + serviceFee

  function handleBooking() {
    if (!dateRange?.from || !dateRange?.to || !property) return
    const params = new URLSearchParams({
      checkIn: format(dateRange.from, 'yyyy-MM-dd'),
      checkOut: format(dateRange.to, 'yyyy-MM-dd'),
      guests,
    })
    navigate(`/book/${property.id}?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <Skeleton className="h-[420px] w-full rounded-2xl bg-white/5" />
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Skeleton className="h-8 w-2/3 bg-white/5" />
              <Skeleton className="h-4 w-1/3 bg-white/5" />
              <Skeleton className="h-32 w-full bg-white/5" />
            </div>
            <Skeleton className="h-64 rounded-2xl bg-white/5" />
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto max-w-7xl px-4 py-24 text-center">
          <h1 className="font-serif text-3xl text-foreground">Property not found</h1>
          <Button className="mt-6 bg-foreground text-background hover:bg-foreground/90" asChild>
            <Link to="/">Back to listings</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-7xl px-4 py-6 animate-fade-in">
        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
          <ChevronRight className="size-3" />
          <span className="capitalize">{property.property_type}s</span>
          <ChevronRight className="size-3" />
          <span className="truncate text-foreground/80">{property.title}</span>
        </div>

        {/* Photo Gallery */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl" style={{ height: '420px' }}>
          <div className="col-span-2 row-span-2 overflow-hidden">
            <img src={photos[0]} alt={property.title} className="size-full object-cover transition-transform duration-500 hover:scale-105" />
          </div>
          {photos.slice(1).map((photo, i) => (
            <div key={i} className="col-span-2 row-span-1 overflow-hidden">
              <img src={photo} alt={`View ${i + 2}`} className="size-full object-cover transition-transform duration-500 hover:scale-105" />
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-8 lg:col-span-2">
            {/* Title & Overview */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  {property.is_featured && (
                    <Badge className="mb-3 border-gold/30 bg-gold/10 text-[10px] font-semibold uppercase tracking-wider text-gold">
                      Featured
                    </Badge>
                  )}
                  <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground md:text-4xl">
                    {property.title}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 shrink-0" />
                      {property.address}, {property.city}, {property.state} {property.zip_code}
                    </span>
                  </div>
                </div>
                {property.rating_avg > 0 && (
                  <div className="shrink-0 text-right">
                    <div className="flex items-center gap-1.5 text-lg font-bold text-foreground">
                      <Star className="size-4 fill-gold text-gold" />
                      {property.rating_avg.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">{property.review_count} reviews</p>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {[
                  { label: property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} Bedroom${property.bedrooms > 1 ? 's' : ''}`, icon: Bed },
                  { label: `${property.bathrooms} Bathroom${property.bathrooms > 1 ? 's' : ''}`, icon: Bath },
                  { label: `Up to ${property.max_guests} guests`, icon: Users },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3.5 py-2 text-sm text-foreground">
                    <item.icon className="size-3.5 text-muted-foreground" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-white/8" />

            {/* Description */}
            <div>
              <h2 className="font-serif text-xl font-normal text-foreground">About this property</h2>
              <p className="mt-4 leading-7 text-muted-foreground">{property.description}</p>
            </div>

            <Separator className="bg-white/8" />

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-normal text-foreground">What this place offers</h2>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {(property.amenities as string[]).map(amenity => (
                    <div key={amenity} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/8">
                        <Check className="size-3 text-foreground" />
                      </div>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="bg-white/8" />

            {/* House rules */}
            <div>
              <h2 className="font-serif text-xl font-normal text-foreground">House rules</h2>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/5">
                    <Clock className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Check-in</p>
                    <p className="text-sm text-muted-foreground">After {property.check_in_time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/5">
                    <Clock className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Check-out</p>
                    <p className="text-sm text-muted-foreground">Before {property.check_out_time}</p>
                  </div>
                </div>
                {property.min_stay_nights > 1 && (
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/5">
                      <CalendarDays className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Minimum stay</p>
                      <p className="text-sm text-muted-foreground">{property.min_stay_nights} nights</p>
                    </div>
                  </div>
                )}
              </div>
              {property.rules && Object.keys(property.rules).length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  {Object.entries(property.rules as Record<string, boolean | string>).map(([rule, value]) => (
                    <div key={rule} className="flex items-center gap-2 text-sm">
                      <span className={value === true || value === 'true' ? 'text-destructive' : 'text-emerald-500'}>
                        {value === true || value === 'true' ? '✕' : '✓'}
                      </span>
                      <span className="capitalize text-muted-foreground">{rule.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column — Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 overflow-hidden border-white/10 bg-card shadow-[0_8px_48px_oklch(0_0_0/40%)]">
              <CardHeader className="pb-4">
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-3xl font-normal text-foreground">${property.price_per_night.toFixed(0)}</span>
                  <span className="text-sm text-muted-foreground">/ night</span>
                </div>
                {property.rating_avg > 0 && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Star className="size-3.5 fill-gold text-gold" />
                    <span className="font-medium text-foreground">{property.rating_avg.toFixed(2)}</span>
                    <span className="text-muted-foreground">· {property.review_count} reviews</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Date Picker */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select dates</p>
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-white/4">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      disabled={(date) => {
                        const today = startOfDay(new Date())
                        if (isBefore(date, today)) return true
                        return bookedDates.some(d =>
                          format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                        )
                      }}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Guests</p>
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger className="border-white/10 bg-white/4">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: property.max_guests }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {i + 1} guest{i > 0 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cost Breakdown */}
                {nights > 0 && (
                  <div className="space-y-2 rounded-xl border border-white/8 bg-white/4 p-3.5 text-sm">
                    <div className="flex justify-between text-foreground">
                      <span>${property.price_per_night.toFixed(0)} × {nights} night{nights > 1 ? 's' : ''}</span>
                      <span>${baseCost.toFixed(2)}</span>
                    </div>
                    {cleaningFee > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Cleaning fee</span>
                        <span>${cleaningFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Service fee ({property.service_fee_percent}%)</span>
                      <span>${serviceFee.toFixed(2)}</span>
                    </div>
                    <Separator className="bg-white/10" />
                    <div className="flex justify-between font-semibold text-foreground">
                      <span>Total</span>
                      <span>${totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-foreground text-background font-semibold transition-all duration-200 hover:bg-foreground/90 hover:scale-[1.01] disabled:opacity-40"
                  size="lg"
                  onClick={handleBooking}
                  disabled={!dateRange?.from || !dateRange?.to || nights < (property.min_stay_nights || 1)}
                >
                  {!dateRange?.from
                    ? 'Select dates to book'
                    : nights < (property.min_stay_nights || 1)
                      ? `Minimum ${property.min_stay_nights} nights`
                      : 'Reserve Now'}
                </Button>

                <p className="text-center text-xs text-muted-foreground">You won&apos;t be charged yet</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
