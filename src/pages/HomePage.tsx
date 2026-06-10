import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, MapPin, Star, Bed, Bath, Users, SlidersHorizontal, ChevronRight, Building2 } from 'lucide-react'
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

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  all: 'All',
  apartment: 'Apartment',
  house: 'House',
  villa: 'Villa',
  cabin: 'Cabin',
  cottage: 'Cottage',
  studio: 'Studio',
  condo: 'Condo',
  townhouse: 'Townhouse',
  other: 'Other',
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
      <section className="relative overflow-hidden">
        {/* Background image with dark overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1800&q=70"
            alt=""
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.068_0_0/80%)] via-[oklch(0.068_0_0/70%)] to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />
        </div>

        <div className="container relative mx-auto max-w-7xl px-4 py-28 md:py-40">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              500+ Premium Properties
            </p>
            <h1 className="font-serif text-5xl font-normal tracking-tight text-foreground text-balance md:text-7xl">
              Find Your Perfect
              <br />
              <em className="not-italic text-gold">Escape</em>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-balance md:text-xl">
              Handpicked rentals from cozy mountain cabins to beachfront villas.
              Book your next stay with confidence.
            </p>

            {/* Search bar — glass card */}
            <div className="mt-10 flex flex-col gap-0 overflow-hidden rounded-2xl glass ring-glow sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search location or property..."
                  className="h-14 border-0 bg-transparent pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="h-px w-full bg-white/8 sm:h-auto sm:w-px" />
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-14 w-full border-0 bg-transparent px-4 focus:ring-0 sm:w-44">
                  <SelectValue placeholder="Property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {PROPERTY_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="p-2">
                <Button
                  size="lg"
                  className="h-10 w-full rounded-xl bg-foreground px-6 text-background font-medium transition-all duration-200 hover:bg-foreground/90 hover:scale-[1.02] sm:h-full sm:w-auto"
                >
                  <Search className="size-4" />
                  <span className="ml-2">Search</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Pills */}
      <section className="sticky top-16 z-40 border-b border-white/8 bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
            {[{ value: 'all', label: 'All' }, ...PROPERTY_TYPES].map(type => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                  selectedType === type.value
                    ? 'bg-foreground text-background shadow-sm'
                    : 'border border-white/10 bg-white/4 text-muted-foreground hover:bg-white/8 hover:text-foreground hover:border-white/20'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="container mx-auto max-w-7xl px-4 py-10">
        {/* Featured Banner */}
        {!search && selectedType === 'all' && featuredProperties.length > 0 && (
          <section className="mb-14 animate-fade-in">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gold">Curated Picks</p>
                <h2 className="mt-1 font-serif text-2xl font-normal text-foreground">Featured Properties</h2>
              </div>
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
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

        {/* Listings header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-normal text-foreground">
              {search
                ? `Results for "${search}"`
                : selectedType !== 'all'
                  ? PROPERTY_TYPE_LABELS[selectedType] + 's'
                  : 'All Properties'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading ? 'Loading...' : `${filteredProperties.length} properties available`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 w-44 border-white/10 bg-white/4 text-sm">
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

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 stagger-children">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <PropertyCardSkeleton key={i} />)
            : filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
        </div>

        {!loading && filteredProperties.length === 0 && (
          <div className="py-24 text-center animate-fade-in">
            <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-white/5 mb-5">
              <Building2 className="size-7 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-2xl text-foreground">No properties found</h3>
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filters</p>
            <Button
              className="mt-6 bg-foreground text-background hover:bg-foreground/90"
              onClick={() => { setSearch(''); setSelectedType('all') }}
            >
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
      <div className="overflow-hidden rounded-2xl border border-white/8 bg-card transition-all duration-300 hover-lift hover-shimmer">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={getPropertyImage(property.property_type)}
            alt={property.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {property.is_featured && (
            <Badge className="absolute left-3 top-3 glass-sm text-[10px] font-semibold uppercase tracking-wider text-foreground border-0">
              Featured
            </Badge>
          )}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg glass-sm px-2 py-1 text-xs font-medium text-foreground">
            <Star className="size-3 fill-gold text-gold" />
            {property.rating_avg > 0 ? property.rating_avg.toFixed(1) : 'New'}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold leading-snug text-foreground">{property.title}</h3>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{property.city}, {property.state}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Bed className="size-3" />{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} bed`}</span>
            <span className="flex items-center gap-1"><Bath className="size-3" />{property.bathrooms} bath</span>
            <span className="flex items-center gap-1"><Users className="size-3" />{property.max_guests}</span>
          </div>
          <Separator className="my-3 bg-white/8" />
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-base font-bold text-foreground">${property.price_per_night.toFixed(0)}</span>
              <span className="ml-1 text-xs text-muted-foreground">/ night</span>
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
      <div className="relative h-60 overflow-hidden rounded-2xl hover-lift">
        <img
          src={getPropertyImage(property.property_type)}
          alt={property.title}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <Badge variant="outline" className="mb-2 border-white/20 bg-white/10 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            {property.property_type}
          </Badge>
          <h3 className="font-semibold leading-snug text-white">{property.title}</h3>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-white/80">
              <MapPin className="size-3" /> {property.city}, {property.state}
            </div>
            <div className="text-sm font-bold text-gold">
              ${property.price_per_night.toFixed(0)}<span className="ml-0.5 text-xs font-normal text-white/60">/night</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-card">
      <Skeleton className="aspect-[4/3] w-full rounded-none bg-white/5" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4 bg-white/5" />
        <Skeleton className="h-3 w-1/2 bg-white/5" />
        <Skeleton className="h-3 w-full bg-white/5" />
        <Skeleton className="h-5 w-1/3 bg-white/5" />
      </div>
    </div>
  )
}
