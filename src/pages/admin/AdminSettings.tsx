import { useState } from 'react'
import { Save, CreditCard, Bell, Globe, Shield, Key, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export function AdminSettings() {
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    siteName: 'Haven',
    siteUrl: 'https://haven.example.com',
    contactEmail: 'admin@haven.com',
    currency: 'USD',
    defaultServiceFee: '12',
    defaultCleaningFee: '50',
    defaultMinStay: '1',
    defaultCheckIn: '15:00',
    defaultCheckOut: '11:00',
    stripePublicKey: 'pk_test_...',
    stripeSecretKey: '',
    paypalClientId: '',
    paypalEnabled: true,
    stripeEnabled: true,
    emailNotifications: true,
    bookingConfirmations: true,
    cancellationAlerts: true,
    newListingReviews: true,
    requireEmailVerification: false,
    autoConfirmBookings: false,
    allowGuestReviews: true,
  })

  function set(key: string, value: string | boolean) {
    setSettings(s => ({ ...s, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800)) // Simulate save
    setSaving(false)
    toast.success('Settings saved successfully')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-normal text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your platform settings</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 hover:scale-[1.02]"
        >
          {saving ? <><Loader2 className="size-4 animate-spin" /> Saving...</> : <><Save className="size-4" /> Save Changes</>}
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex w-full border border-white/8 bg-white/4 md:w-auto">
          <TabsTrigger value="general" className="flex-1 data-[state=active]:bg-white/10 data-[state=active]:text-foreground md:flex-none">
            <Globe className="size-3.5 mr-1.5" />General
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex-1 data-[state=active]:bg-white/10 data-[state=active]:text-foreground md:flex-none">
            <CreditCard className="size-3.5 mr-1.5" />Payments
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 data-[state=active]:bg-white/10 data-[state=active]:text-foreground md:flex-none">
            <Bell className="size-3.5 mr-1.5" />Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1 data-[state=active]:bg-white/10 data-[state=active]:text-foreground md:flex-none">
            <Shield className="size-3.5 mr-1.5" />Security
          </TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="mt-6 space-y-6">
            <Card className="border-white/8 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Site Information</CardTitle>
              <CardDescription>Basic configuration for your rental platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Site Name</Label>
                  <Input value={settings.siteName} onChange={e => set('siteName', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Site URL</Label>
                  <Input value={settings.siteUrl} onChange={e => set('siteUrl', e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Contact Email</Label>
                  <Input type="email" value={settings.contactEmail} onChange={e => set('contactEmail', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Select value={settings.currency} onValueChange={v => set('currency', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD – US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR – Euro</SelectItem>
                      <SelectItem value="GBP">GBP – British Pound</SelectItem>
                      <SelectItem value="CAD">CAD – Canadian Dollar</SelectItem>
                      <SelectItem value="AUD">AUD – Australian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

            <Card className="border-white/8 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Listing Defaults</CardTitle>
              <CardDescription>Default values applied to new property listings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Default Service Fee (%)</Label>
                  <Input type="number" value={settings.defaultServiceFee} onChange={e => set('defaultServiceFee', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Default Cleaning Fee ($)</Label>
                  <Input type="number" value={settings.defaultCleaningFee} onChange={e => set('defaultCleaningFee', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Default Min Stay (nights)</Label>
                  <Input type="number" min={1} value={settings.defaultMinStay} onChange={e => set('defaultMinStay', e.target.value)} />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Default Check-in Time</Label>
                  <Input type="time" value={settings.defaultCheckIn} onChange={e => set('defaultCheckIn', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Default Check-out Time</Label>
                  <Input type="time" value={settings.defaultCheckOut} onChange={e => set('defaultCheckOut', e.target.value)} />
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Auto-confirm Bookings</p>
                  <p className="text-xs text-muted-foreground">Automatically confirm bookings without manual review</p>
                </div>
                <Switch
                  checked={settings.autoConfirmBookings}
                  onCheckedChange={v => set('autoConfirmBookings', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Allow Guest Reviews</p>
                  <p className="text-xs text-muted-foreground">Guests can leave reviews after their stay</p>
                </div>
                <Switch
                  checked={settings.allowGuestReviews}
                  onCheckedChange={v => set('allowGuestReviews', v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments" className="mt-6 space-y-6">
            <Card className="border-white/8 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <div className="flex size-6 items-center justify-center rounded bg-foreground text-background text-xs font-bold">S</div>
                Stripe Configuration
              </CardTitle>
              <CardDescription>Enable credit card payments via Stripe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Enable Stripe Payments</p>
                  <p className="text-xs text-muted-foreground">Accept Visa, Mastercard, Amex, and more</p>
                </div>
                <Switch
                  checked={settings.stripeEnabled}
                  onCheckedChange={v => set('stripeEnabled', v)}
                />
              </div>
              {settings.stripeEnabled && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-2">
                        <Key className="size-3.5" /> Publishable Key
                        <Badge variant="secondary" className="text-xs">Public</Badge>
                      </Label>
                      <Input
                        placeholder="pk_live_..."
                        value={settings.stripePublicKey}
                        onChange={e => set('stripePublicKey', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-2">
                        <Key className="size-3.5" /> Secret Key
                        <Badge variant="destructive" className="text-xs">Server only</Badge>
                      </Label>
                      <Input
                        type="password"
                        placeholder="sk_live_..."
                        value={settings.stripeSecretKey}
                        onChange={e => set('stripeSecretKey', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Store this in your edge function environment variables, never in client code.</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

            <Card className="border-white/8 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <div className="flex size-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">P</div>
                PayPal Configuration
              </CardTitle>
              <CardDescription>Enable PayPal checkout for guests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Enable PayPal</p>
                  <p className="text-xs text-muted-foreground">Guests can pay using their PayPal balance or cards</p>
                </div>
                <Switch
                  checked={settings.paypalEnabled}
                  onCheckedChange={v => set('paypalEnabled', v)}
                />
              </div>
              {settings.paypalEnabled && (
                <>
                  <Separator />
                  <div className="space-y-1.5">
                    <Label>Client ID</Label>
                    <Input
                      placeholder="AXxxxxxxxx..."
                      value={settings.paypalClientId}
                      onChange={e => set('paypalClientId', e.target.value)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-6">
          <Card className="border-white/8 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Email Notifications</CardTitle>
              <CardDescription>Configure when automated emails are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Master toggle for all email notifications' },
                { key: 'bookingConfirmations', label: 'Booking Confirmations', desc: 'Send confirmation emails to guests upon booking' },
                { key: 'cancellationAlerts', label: 'Cancellation Alerts', desc: 'Notify when a booking is cancelled' },
                { key: 'newListingReviews', label: 'New Reviews', desc: 'Alert when a guest leaves a review' },
              ].map((n, i) => (
                <div key={n.key}>
                  {i > 0 && <Separator className="my-3" />}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                    </div>
                    <Switch
                      checked={settings[n.key as keyof typeof settings] as boolean}
                      onCheckedChange={v => set(n.key, v)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-6">
          <Card className="border-white/8 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Access &amp; Security</CardTitle>
              <CardDescription>Control platform access and authentication requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Require Email Verification</p>
                  <p className="text-xs text-muted-foreground">Users must verify email before booking</p>
                </div>
                <Switch
                  checked={settings.requireEmailVerification}
                  onCheckedChange={v => set('requireEmailVerification', v)}
                />
              </div>
              <Separator />
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium">Security Recommendations</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> API keys are stored in environment variables</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Row Level Security (RLS) enabled on all database tables</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Payment data processed by Stripe/PayPal (PCI compliant)</li>
                  <li className="flex items-center gap-2"><span className="text-yellow-500">⚠</span> Configure production API keys before going live</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
