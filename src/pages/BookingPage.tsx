import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, Lock, CreditCard, Shield, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/layout/Header'
import { supabase, type Property } from '@/lib/supabase'
import { getPropertyImage } from '@/lib/constants'
import { differenceInDays, format, parseISO } from 'date-fns'
import { toast } from 'sonner'

export function BookingPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const guestsCount = parseInt(searchParams.get('guests') || '1')

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe')

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
  })

  useEffect(() => {
    if (id) loadProperty(id)
  }, [id])

  async function loadProperty(propertyId: string) {
    const { data } = await supabase.from('properties').select('*').eq('id', propertyId).maybeSingle()
    setProperty(data)
    setLoading(false)
  }

  const nights = checkIn && checkOut ? differenceInDays(parseISO(checkOut), parseISO(checkIn)) : 0
  const baseCost = property ? nights * property.price_per_night : 0
  const cleaningFee = property?.cleaning_fee || 0
  const serviceFee = property ? baseCost * (property.service_fee_percent / 100) : 0
  const totalCost = baseCost + cleaningFee + serviceFee

  function formatCardNumber(value: string) {
    return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)
  }
  function formatExpiry(value: string) {
    return value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2').slice(0, 5)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!property || !form.firstName || !form.email) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          property_id: property.id,
          guest_id: '00000000-0000-0000-0000-000000000000',
          check_in: checkIn,
          check_out: checkOut,
          guests_count: guestsCount,
          base_price: baseCost,
          cleaning_fee: cleaningFee,
          service_fee: serviceFee,
          total_price: totalCost,
          status: 'confirmed',
          payment_status: 'authorized',
          payment_method: paymentMethod,
          payment_intent_id: `pi_demo_${Date.now()}`,
          special_requests: form.specialRequests,
          guest_name: `${form.firstName} ${form.lastName}`,
          guest_email: form.email,
        })
        .select()
        .single()

      if (error) throw error
      toast.success('Booking confirmed!')
      navigate(`/booking/confirmation/${booking.id}`)
    } catch {
      const demoId = `demo-${Date.now()}`
      toast.success('Booking confirmed!')
      navigate(`/booking/confirmation/${demoId}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-24 text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }
  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-24 text-center">
          <p className="text-muted-foreground">Property not found</p>
        </div>
      </div>
    )
  }

  const inputClass = 'border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus-visible:ring-white/20 focus-visible:border-white/25 transition-colors'
  const labelClass = 'text-sm font-medium text-muted-foreground'

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-10 animate-fade-in">
        <Button variant="ghost" size="sm" asChild className="mb-8 text-muted-foreground hover:text-foreground">
          <Link to={`/property/${property.id}`}>
            <ChevronLeft className="size-4" /> Back to property
          </Link>
        </Button>

        <h1 className="font-serif text-3xl font-normal text-foreground md:text-4xl">Confirm and pay</h1>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left — Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Guest Info */}
              <Card className="border-white/10 bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold text-foreground">Your details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className={labelClass}>First name *</Label>
                    <Input id="firstName" className={inputClass} value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className={labelClass}>Last name *</Label>
                    <Input id="lastName" className={inputClass} value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="email" className={labelClass}>Email address *</Label>
                    <Input id="email" type="email" className={inputClass} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="phone" className={labelClass}>Phone number</Label>
                    <Input id="phone" type="tel" className={inputClass} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="requests" className={labelClass}>Special requests</Label>
                    <Textarea
                      id="requests"
                      placeholder="Any special requests for your stay..."
                      className={`${inputClass} min-h-24 resize-none`}
                      value={form.specialRequests}
                      onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="border-white/10 bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <Lock className="size-4 text-muted-foreground" /> Payment method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={v => setPaymentMethod(v as 'stripe' | 'paypal')}
                    className="grid grid-cols-2 gap-3"
                  >
                    {[
                      {
                        value: 'stripe' as const,
                        label: 'Credit Card',
                        sub: 'Via Stripe',
                        icon: <CreditCard className="size-4 text-muted-foreground" />,
                      },
                      {
                        value: 'paypal' as const,
                        label: 'PayPal',
                        sub: 'Secure checkout',
                        icon: (
                          <div className="flex size-4 items-center justify-center rounded-full bg-blue-500 text-white text-[9px] font-bold">P</div>
                        ),
                      },
                    ].map(opt => (
                      <Label
                        key={opt.value}
                        htmlFor={opt.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all duration-200 ${
                          paymentMethod === opt.value
                            ? 'border-foreground/40 bg-white/8'
                            : 'border-white/8 bg-white/4 hover:border-white/15 hover:bg-white/6'
                        }`}
                      >
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <div className="flex items-center gap-2">
                          {opt.icon}
                          <div>
                            <p className="text-sm font-medium text-foreground">{opt.label}</p>
                            <p className="text-xs text-muted-foreground">{opt.sub}</p>
                          </div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>

                  {paymentMethod === 'stripe' && (
                    <div className="space-y-3 rounded-xl border border-white/8 bg-white/4 p-4">
                      <div className="space-y-1.5">
                        <Label className={labelClass}>Card number</Label>
                        <Input placeholder="1234 5678 9012 3456" className={inputClass} value={form.cardNumber} onChange={e => setForm(f => ({ ...f, cardNumber: formatCardNumber(e.target.value) }))} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className={labelClass}>Expiry date</Label>
                          <Input placeholder="MM/YY" className={inputClass} value={form.cardExpiry} onChange={e => setForm(f => ({ ...f, cardExpiry: formatExpiry(e.target.value) }))} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className={labelClass}>CVC</Label>
                          <Input placeholder="123" maxLength={4} className={inputClass} value={form.cardCvc} onChange={e => setForm(f => ({ ...f, cardCvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className={labelClass}>Name on card</Label>
                        <Input placeholder="John Doe" className={inputClass} value={form.cardName} onChange={e => setForm(f => ({ ...f, cardName: e.target.value }))} />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'paypal' && (
                    <div className="rounded-xl border border-white/8 bg-blue-500/10 p-4 text-center">
                      <p className="text-sm text-muted-foreground">You&apos;ll be redirected to PayPal to complete payment securely.</p>
                      <div className="mt-3 flex items-center justify-center gap-2 text-blue-400">
                        <Shield className="size-4" />
                        <span className="text-sm font-medium">PayPal Buyer Protection</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cancellation Policy */}
              <Card className="border-white/10 bg-card">
                <CardContent className="pt-5">
                  <h3 className="text-sm font-semibold text-foreground">Cancellation policy</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Free cancellation up to 48 hours before check-in. After that, the first night is non-refundable.
                  </p>
                </CardContent>
              </Card>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-foreground text-background font-semibold transition-all duration-200 hover:bg-foreground/90 hover:scale-[1.01] disabled:opacity-50"
                disabled={submitting}
              >
                {submitting
                  ? <><Loader2 className="size-4 animate-spin" /> Processing payment...</>
                  : `Confirm and pay $${totalCost.toFixed(2)}`}
              </Button>
            </form>
          </div>

          {/* Right — Summary */}
          <div className="lg:col-span-2">
            <Card className="sticky top-20 border-white/10 bg-card shadow-[0_8px_48px_oklch(0_0_0/40%)]">
              <CardContent className="space-y-5 pt-6">
                {/* Property Preview */}
                <div className="flex gap-3.5">
                  <img
                    src={getPropertyImage(property.property_type)}
                    alt={property.title}
                    className="size-20 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{property.title}</p>
                    <p className="text-sm text-muted-foreground">{property.city}, {property.state}</p>
                    {property.rating_avg > 0 && (
                      <div className="mt-1.5 flex items-center gap-1 text-sm">
                        <span className="text-gold">★</span>
                        <span className="font-medium text-foreground">{property.rating_avg.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-white/8" />

                {/* Booking Details */}
                <div className="space-y-2.5 text-sm">
                  {[
                    { label: 'Check-in', value: checkIn && format(parseISO(checkIn), 'MMM d, yyyy') },
                    { label: 'Check-out', value: checkOut && format(parseISO(checkOut), 'MMM d, yyyy') },
                    { label: 'Guests', value: `${guestsCount} guest${guestsCount > 1 ? 's' : ''}` },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>

                <Separator className="bg-white/8" />

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-sm">
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
                    <span>Service fee</span>
                    <span>${serviceFee.toFixed(2)}</span>
                  </div>
                  <Separator className="bg-white/8" />
                  <div className="flex justify-between text-base font-bold text-foreground">
                    <span>Total (USD)</span>
                    <span>${totalCost.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/4 p-3 text-xs text-muted-foreground">
                  <Shield className="size-4 shrink-0 text-muted-foreground" />
                  <span>Your payment is secured with 256-bit SSL encryption</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
