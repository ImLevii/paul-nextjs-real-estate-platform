import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, Home, CalendarDays, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/Header'

export function BookingConfirmationPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-20 text-center animate-fade-in">
        {/* Success icon */}
        <div className="inline-flex size-24 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
          <CheckCircle2 className="size-12 text-emerald-400" strokeWidth={1.5} />
        </div>

        <h1 className="mt-7 font-serif text-4xl font-normal text-foreground">
          Booking Confirmed
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
          Your reservation has been successfully processed and confirmed.
        </p>

        <Card className="mt-10 border-white/10 bg-card text-left shadow-[0_8px_48px_oklch(0_0_0/40%)]">
          <CardContent className="space-y-5 pt-6">
            {/* Booking ref */}
            <div className="flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/6">
                <CalendarDays className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Booking Reference</p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">{id}</p>
              </div>
            </div>

            <Separator className="bg-white/8" />

            {/* Email */}
            <div className="flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/6">
                <Mail className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Confirmation Email</p>
                <p className="mt-0.5 text-sm text-muted-foreground">A confirmation has been sent to your email address</p>
              </div>
            </div>

            <Separator className="bg-white/8" />

            {/* What's next */}
            <div className="rounded-xl border border-white/8 bg-white/4 p-5">
              <h3 className="text-sm font-semibold text-foreground">What&apos;s next?</h3>
              <ul className="mt-4 space-y-3">
                {[
                  'Check your email for full booking details and check-in instructions',
                  'The host will confirm your reservation within 24 hours',
                  'Check-in instructions will be sent 48 hours before arrival',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            className="bg-foreground text-background font-medium transition-all hover:bg-foreground/90 hover:scale-[1.02]"
          >
            <Link to="/">
              <Home className="size-4" /> Browse more properties
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="border-white/12 bg-white/5 text-foreground transition-all hover:bg-white/10 hover:border-white/20"
          >
            <Link to="/admin/bookings">
              View booking details <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
