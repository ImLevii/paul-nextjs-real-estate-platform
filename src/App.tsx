import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

import { HomePage } from '@/pages/HomePage'
import { PropertyDetailPage } from '@/pages/PropertyDetailPage'
import { BookingPage } from '@/pages/BookingPage'
import { BookingConfirmationPage } from '@/pages/BookingConfirmationPage'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminListings } from '@/pages/admin/AdminListings'
import { AdminListingEdit } from '@/pages/admin/AdminListingEdit'
import { AdminBookings } from '@/pages/admin/AdminBookings'
import { AdminBookingDetail } from '@/pages/admin/AdminBookingDetail'
import { AdminSettings } from '@/pages/admin/AdminSettings'

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="haven-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route path="/book/:id" element={<BookingPage />} />
          <Route path="/booking/confirmation/:id" element={<BookingConfirmationPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="listings/new" element={<AdminListingEdit />} />
            <Route path="listings/:id" element={<AdminListingEdit />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="bookings/:id" element={<AdminBookingDetail />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  )
}
