import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Home, CalendarDays, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/Header'

export function BookingConfirmationPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="flex justify-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="size-10 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="mt-6 scroll-m-20 text-3xl font-bold tracking-tight">
          Booking Confirmed!
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Your reservation has been successfully processed.
        </p>

        <Card className="mt-8 text-left">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <CalendarDays className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Booking Reference</p>
                <p className="text-sm font-mono text-muted-foreground">{id}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <Mail className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Confirmation Email</p>
                <p className="text-sm text-muted-foreground">A confirmation has been sent to your email address</p>
              </div>
            </div>

            <Separator />

            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="font-semibold">What's next?</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                  Check your email for full booking details and instructions
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                  The host will confirm your reservation within 24 hours
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                  Check-in instructions will be sent 48 hours before arrival
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link to="/">
              <Home className="size-4" /> Browse more properties
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/bookings">
              View booking details <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
