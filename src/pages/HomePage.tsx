import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, MapPin, Star, Bed, Bath, Users, SlidersHorizontal, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { supabase, type Property } from '@/lib/supabase'
import { PROPERTY_TYPES, getPropertyImage } from '@/lib/constants'

const PROPERTY_TYPE_ICONS: Record<string, string> = {
  all: '🏠',
  apartment: '🏢',
  house: '🏡',
  villa: '🏛️',
  cabin: '🌲',
  cottage: '🏘️',
  studio: '🏙️',
  condo: '🏗️',
  townhouse: '🏠',
  other: '🔑',
}

export function HomePage() {
  const [searchParams] = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all')
  const [sortBy, setSortBy] = useState('featured')

  useEffect(() => {
    loadProperties()
  }, [selectedType, sortBy])

  async function loadProperties() {
    setLoading(true)
    let query = supabase.from('properties').select('*').eq('is_active', true)

    if (selectedType !== 'all') {
      query = query.eq('property_type', selectedType)
    }

    if (sortBy === 'featured') {
      query = query.order('is_featured', { ascending: false }).order('rating_avg', { ascending: false })
    } else if (sortBy === 'price_asc') {
      query = query.order('price_per_night', { ascending: true })
    } else if (sortBy === 'price_desc') {
      query = query.order('price_per_night', { ascending: false })
    } else if (sortBy === 'rating') {
      query = query.order('rating_avg', { ascending: false })
    }

    const { data } = await query
    setProperties(data || [])
    setLoading(false)
  }

  const filteredProperties = properties.filter(p =>
    !search ||
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    p.state.toLowerCase().includes(search.toLowerCase())
  )

  const featuredProperties = properties.filter(p => p.is_featured).slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-foreground/5 via-background to-foreground/5">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1800&q=60')] bg-cover bg-center opacity-10" />
        <div className="container relative mx-auto max-w-7xl px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4 text-xs">
              500+ Premium Properties
            </Badge>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance md:text-6xl">
              Find Your Perfect
              <span className="text-primary"> Escape</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground text-balance">
              Discover handpicked rentals from cozy mountain cabins to beachfront villas. Book with confidence.
            </p>

            {/* Search bar */}
            <div className="mt-8 flex flex-col gap-3 rounded-2xl border bg-card p-3 shadow-lg sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by location or property name..."
                  className="border-0 pl-9 shadow-none focus-visible:ring-0"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Separator orientation="vertical" className="hidden h-auto sm:block" />
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full border-0 shadow-none sm:w-40">
                  <SelectValue placeholder="Property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {PROPERTY_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="lg" className="w-full sm:w-auto">
                <Search className="size-4" /> Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Pills */}
      <section className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
            {[{ value: 'all', label: 'All' }, ...PROPERTY_TYPES].map(type => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedType === type.value
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background text-muted-foreground hover:border-foreground/50 hover:text-foreground'
                }`}
              >
                <span>{PROPERTY_TYPE_ICONS[type.value]}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Featured Banner */}
        {!search && selectedType === 'all' && featuredProperties.length > 0 && (
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Featured Properties</h2>
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ChevronRight className="size-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {featuredProperties.map(property => (
                <FeaturedPropertyCard key={property.id} property={property} />
              ))}
            </div>
          </section>
        )}

        {/* All Listings */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              {search ? `Results for "${search}"` : selectedType !== 'all' ? `${PROPERTY_TYPES.find(t => t.value === selectedType)?.label}s` : 'All Properties'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading ? 'Loading...' : `${filteredProperties.length} properties available`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 w-44 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Top Picks</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <PropertyCardSkeleton key={i} />)
            : filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
        </div>

        {!loading && filteredProperties.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-4xl">🏠</p>
            <h3 className="mt-4 text-lg font-semibold">No properties found</h3>
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filters</p>
            <Button className="mt-4" onClick={() => { setSearch(''); setSelectedType('all') }}>
              Clear Filters
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

function PropertyCard({ property }: { property: Property }) {
  return (
    <Link to={`/property/${property.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={getPropertyImage(property.property_type)}
            alt={property.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {property.is_featured && (
            <Badge className="absolute left-3 top-3 bg-background/90 text-foreground backdrop-blur-sm">
              Featured
            </Badge>
          )}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-background/90 px-2 py-1 text-xs font-medium backdrop-blur-sm">
            <Star className="size-3 fill-current text-yellow-500" />
            {property.rating_avg > 0 ? property.rating_avg.toFixed(1) : 'New'}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-semibold leading-snug">{property.title}</h3>
              <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{property.city}, {property.state}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Bed className="size-3" />{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} bed`}</span>
            <span className="flex items-center gap-1"><Bath className="size-3" />{property.bathrooms} bath</span>
            <span className="flex items-center gap-1"><Users className="size-3" />{property.max_guests} guests</span>
          </div>
          <Separator className="my-3" />
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-lg font-bold">${property.price_per_night.toFixed(0)}</span>
              <span className="text-sm text-muted-foreground"> / night</span>
            </div>
            {property.review_count > 0 && (
              <span className="text-xs text-muted-foreground">{property.review_count} reviews</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function FeaturedPropertyCard({ property }: { property: Property }) {
  return (
    <Link to={`/property/${property.id}`} className="group block">
      <div className="relative h-56 overflow-hidden rounded-xl bg-muted">
        <img
          src={getPropertyImage(property.property_type)}
          alt={property.title}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <Badge variant="secondary" className="mb-2 text-xs">{property.property_type}</Badge>
          <h3 className="font-semibold leading-tight">{property.title}</h3>
          <div className="mt-1 flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm opacity-90">
              <MapPin className="size-3" /> {property.city}, {property.state}
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold">
              ${property.price_per_night.toFixed(0)}<span className="text-xs font-normal opacity-80">/night</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  )
}
