export type Language = 'en' | 'ar'

export type VehicleStatus = 'available' | 'reserved' | 'sold'
export type PriceMode = 'show' | 'hide' | 'band'
export type PriceBand = 'entry' | 'mid' | 'high' | 'ultra'
export type BodyType = 'sedan' | 'suv' | 'coupe' | 'convertible' | 'hatchback' | 'truck' | 'van'
export type FuelType = 'gasoline' | 'diesel' | 'hybrid' | 'electric'
export type Transmission = 'automatic' | 'manual'
export type Drivetrain = 'awd' | 'rwd' | 'fwd' | '4wd'
export type Origin = 'local' | 'imported'

export interface VehicleImage {
  url: string
  alt: string
  order: number
}

export interface Vehicle {
  id: string
  slug: string
  status: VehicleStatus
  make: string
  model: string
  trim: string
  year: number
  mileage: number
  price: number | null
  priceMode: PriceMode
  priceBand?: PriceBand
  exteriorColor: string
  interiorColor: string
  bodyType: BodyType
  transmission: Transmission
  drivetrain: Drivetrain
  engine: string
  fuelType: FuelType
  origin: Origin
  importCountry?: string
  descriptionEn: string
  descriptionAr: string
  featuresEn: string[]
  featuresAr: string[]
  images: VehicleImage[]
  tags: string[]
  featured: boolean
  createdAt: string
  updatedAt: string
}

export interface Branch {
  id: string
  nameEn: string
  nameAr: string
  addressEn: string
  addressAr: string
  googleMapsUrl: string
  phone: string
  whatsapp: string
  hoursEn: string
  hoursAr: string
  image?: string
}

export interface ContactFormData {
  name: string
  phone: string
  preferredContact: 'whatsapp' | 'call' | 'email'
  message: string
  carOfInterest?: string
}

export interface FilterState {
  search: string
  make: string[]
  model: string[]
  yearMin: number | null
  yearMax: number | null
  mileageMin: number | null
  mileageMax: number | null
  priceMin: number | null
  priceMax: number | null
  bodyType: string[]
  fuelType: string[]
  transmission: string[]
  origin: string[]
  sortBy: 'newest' | 'year-desc' | 'year-asc' | 'mileage-asc' | 'price-asc' | 'price-desc'
}
