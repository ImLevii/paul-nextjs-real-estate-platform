import type { Property, PropertyPhoto, Booking, HeroSlide } from './supabase'

export type BookingWithProperty = Booking & { property?: Pick<Property, 'id' | 'title' | 'city' | 'state' | 'property_type'> | null }

// In dev, Vite proxies /api → http://localhost:3001
// In production, set VITE_API_URL to your deployed API origin
const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

function getAdminToken(): string | null {
  return localStorage.getItem('haven_admin_token')
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {}
  if (body) headers['Content-Type'] = 'application/json'
  const token = getAdminToken()
  if (token && path.startsWith('/admin/')) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

const get = <T>(path: string, params?: Record<string, string | undefined>) => {
  const url = new URL(`${BASE}/api${path}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined) url.searchParams.set(k, v) })
  }
  return req<T>('GET', path + (url.search ? `?${url.searchParams.toString()}` : ''))
}

export const api = {
  heroSlides: {
    list: () => get<HeroSlide[]>('/hero-slides'),
  },

  properties: {
    list: (params?: { active?: boolean; type?: string; sort?: string }) =>
      get<Property[]>('/properties', {
        active: params?.active !== undefined ? String(params.active) : undefined,
        type: params?.type,
        sort: params?.sort,
      }),
    get: (id: string) => get<Property>(`/properties/${id}`),
    getBookedDates: (id: string) =>
      get<Pick<Booking, 'check_in' | 'check_out'>[]>(`/properties/${id}/booked-dates`),
  },

  bookings: {
    get: (id: string) => get<Booking>(`/bookings/${id}`),
    create: (data: Partial<Booking>) => req<Booking>('POST', '/bookings', data),
  },

  admin: {
    login: (data: { username: string; password: string }) =>
      req<{ token: string }>('POST', '/admin/login', data),

    properties: {
      list: () => get<Property[]>('/admin/properties'),
      get: (id: string) => get<Property & { photos: PropertyPhoto[] }>(`/admin/properties/${id}`),
      create: (data: Partial<Property>) => req<Property>('POST', '/admin/properties', data),
      update: (id: string, data: Partial<Property>) => req<Property>('PATCH', `/admin/properties/${id}`, data),
      delete: (id: string) => req<{ ok: boolean }>('DELETE', `/admin/properties/${id}`),
      savePhotos: (
        id: string,
        photos: Array<{ url: string; is_primary: boolean; sort_order: number }>,
      ) => req<{ ok: boolean }>('POST', `/admin/properties/${id}/photos`, photos),
    },

    bookings: {
      list: () => get<BookingWithProperty[]>('/admin/bookings'),
      get: (id: string) =>
        get<{ booking: Booking; property: Property | null }>(`/admin/bookings/${id}`),
      update: (id: string, data: { status?: string; payment_status?: string }) =>
        req<Booking>('PATCH', `/admin/bookings/${id}`, data),
    },

    heroSlides: {
      list: () => get<HeroSlide[]>('/admin/hero-slides'),
      create: (data: Partial<HeroSlide>) => req<HeroSlide>('POST', '/admin/hero-slides', data),
      update: (id: string, data: Partial<HeroSlide>) => req<HeroSlide>('PATCH', `/admin/hero-slides/${id}`, data),
      delete: (id: string) => req<{ ok: boolean }>('DELETE', `/admin/hero-slides/${id}`),
    },
  },
}