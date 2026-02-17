import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import SectionHeading from '../components/ui/SectionHeading'
import SearchBar from '../components/inventory/SearchBar'
import InventoryFilters from '../components/inventory/InventoryFilters'
import InventoryGrid from '../components/inventory/InventoryGrid'
import CustomSelect from '../components/ui/CustomSelect'
import { vehicles as allVehicles } from '../data/vehicles'
import { getModelsByMake } from '../data/vehicles'
import type { FilterState } from '../types'
import { useLanguage } from '../context/LanguageContext'

interface FilterChip {
  key: string
  label: string
  onRemove: () => void
}

export default function Inventory() {
  const { t, lang } = useLanguage()
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    make: [],
    model: [],
    yearMin: null,
    yearMax: null,
    mileageMin: null,
    mileageMax: null,
    priceMin: null,
    priceMax: null,
    bodyType: [],
    fuelType: [],
    transmission: [],
    origin: [],
    sortBy: 'newest',
  })

  // Compute data-driven bounds (same as InventoryFilters, for chip labels)
  const bounds = useMemo(() => {
    const available = allVehicles.filter(v => v.status !== 'sold')
    const years = available.map(v => v.year)
    const mileages = available.map(v => v.mileage)
    const prices = available.filter(v => v.price != null).map(v => v.price!)
    return {
      yearMin: Math.min(...years),
      yearMax: Math.max(...years),
      mileageMin: Math.min(...mileages),
      mileageMax: Math.max(...mileages),
      priceMin: prices.length ? Math.min(...prices) : 0,
      priceMax: prices.length ? Math.max(...prices) : 0,
    }
  }, [])
  const formatNumber = useCallback(
    (value: number) => value.toLocaleString(lang === 'ar' ? 'ar-JO' : 'en-US'),
    [lang]
  )

  const filtered = useMemo(() => {
    let result = allVehicles.filter(v => v.status !== 'sold')

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(v =>
        `${v.make} ${v.model} ${v.trim} ${v.year} ${v.tags.join(' ')}`.toLowerCase().includes(q)
      )
    }

    // Categorical filters (multi-select: OR within category)
    if (filters.make.length) result = result.filter(v => filters.make.includes(v.make))
    if (filters.model.length) result = result.filter(v => filters.model.includes(v.model))
    if (filters.bodyType.length) result = result.filter(v => filters.bodyType.includes(v.bodyType))
    if (filters.fuelType.length) result = result.filter(v => filters.fuelType.includes(v.fuelType))
    if (filters.transmission.length) result = result.filter(v => filters.transmission.includes(v.transmission))
    if (filters.origin.length) result = result.filter(v => filters.origin.includes(v.origin))

    // Range filters
    if (filters.yearMin) result = result.filter(v => v.year >= filters.yearMin!)
    if (filters.yearMax) result = result.filter(v => v.year <= filters.yearMax!)
    if (filters.mileageMin) result = result.filter(v => v.mileage >= filters.mileageMin!)
    if (filters.mileageMax) result = result.filter(v => v.mileage <= filters.mileageMax!)
    if (filters.priceMin) result = result.filter(v => v.price != null && v.price >= filters.priceMin!)
    if (filters.priceMax) result = result.filter(v => v.price != null && v.price <= filters.priceMax!)

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'year-desc':
        result.sort((a, b) => b.year - a.year)
        break
      case 'year-asc':
        result.sort((a, b) => a.year - b.year)
        break
      case 'mileage-asc':
        result.sort((a, b) => a.mileage - b.mileage)
        break
    }

    return result
  }, [filters])

  // Build active filter chip list
  const activeChips = useMemo((): FilterChip[] => {
    const chips: FilterChip[] = []

    // Make chips
    for (const make of filters.make) {
      chips.push({
        key: `make-${make}`,
        label: make,
        onRemove: () => {
          const newMakes = filters.make.filter(m => m !== make)
          // Prune models that no longer belong to any selected make
          const validModels = new Set(newMakes.flatMap(m => getModelsByMake(m)))
          const newModels = filters.model.filter(m => validModels.has(m))
          setFilters(prev => ({ ...prev, make: newMakes, model: newModels }))
        },
      })
    }

    // Model chips
    for (const model of filters.model) {
      chips.push({
        key: `model-${model}`,
        label: model,
        onRemove: () => setFilters(prev => ({ ...prev, model: prev.model.filter(m => m !== model) })),
      })
    }

    // Body type chips
    for (const bt of filters.bodyType) {
      chips.push({
        key: `bodyType-${bt}`,
        label: t(`bodyTypes.${bt}`),
        onRemove: () => setFilters(prev => ({ ...prev, bodyType: prev.bodyType.filter(v => v !== bt) })),
      })
    }

    // Fuel type chips
    for (const ft of filters.fuelType) {
      chips.push({
        key: `fuelType-${ft}`,
        label: t(`fuelTypes.${ft}`),
        onRemove: () => setFilters(prev => ({ ...prev, fuelType: prev.fuelType.filter(v => v !== ft) })),
      })
    }

    // Transmission chips
    for (const tr of filters.transmission) {
      chips.push({
        key: `transmission-${tr}`,
        label: t(`transmissions.${tr}`),
        onRemove: () => setFilters(prev => ({ ...prev, transmission: prev.transmission.filter(v => v !== tr) })),
      })
    }

    // Origin chips
    for (const org of filters.origin) {
      const label = org === 'local' ? t('vehicle.local') : t('vehicle.imported')
      chips.push({
        key: `origin-${org}`,
        label,
        onRemove: () => setFilters(prev => ({ ...prev, origin: prev.origin.filter(v => v !== org) })),
      })
    }

    // Year range chip
    if (filters.yearMin !== null || filters.yearMax !== null) {
      const lo = filters.yearMin ?? bounds.yearMin
      const hi = filters.yearMax ?? bounds.yearMax
      chips.push({
        key: 'year-range',
        label: `${t('inventory.yearRange')}: ${lo}–${hi}`,
        onRemove: () => setFilters(prev => ({ ...prev, yearMin: null, yearMax: null })),
      })
    }

    // Mileage range chip
    if (filters.mileageMin !== null || filters.mileageMax !== null) {
      const lo = filters.mileageMin ?? bounds.mileageMin
      const hi = filters.mileageMax ?? bounds.mileageMax
      chips.push({
        key: 'mileage-range',
        label: `${t('inventory.mileageRange')}: ${formatNumber(lo)}–${formatNumber(hi)} KM`,
        onRemove: () => setFilters(prev => ({ ...prev, mileageMin: null, mileageMax: null })),
      })
    }

    // Price range chip
    if (filters.priceMin !== null || filters.priceMax !== null) {
      const lo = filters.priceMin ?? bounds.priceMin
      const hi = filters.priceMax ?? bounds.priceMax
      chips.push({
        key: 'price-range',
        label: `${t('inventory.priceRange')}: ${formatNumber(lo)}–${formatNumber(hi)} JOD`,
        onRemove: () => setFilters(prev => ({ ...prev, priceMin: null, priceMax: null })),
      })
    }

    return chips
  }, [filters, t, bounds, formatNumber])

  const clearFilters = () => {
    setFilters(prev => ({
      ...prev,
      make: [],
      model: [],
      yearMin: null,
      yearMax: null,
      mileageMin: null,
      mileageMax: null,
      priceMin: null,
      priceMax: null,
      bodyType: [],
      fuelType: [],
      transmission: [],
      origin: [],
    }))
  }

  const sortOptions = [
    { value: 'newest', label: t('inventory.sortNewest') },
    { value: 'year-desc', label: t('inventory.sortYearDesc') },
    { value: 'year-asc', label: t('inventory.sortYearAsc') },
    { value: 'mileage-asc', label: t('inventory.sortMileageAsc') },
  ]

  return (
    <div className="pt-24 md:pt-32 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeading
          title={t('inventory.title')}
          subtitle={t('inventory.subtitle')}
        />

        {/* Search + Sort bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="flex-1">
            <SearchBar
              value={filters.search}
              onChange={(search) => setFilters(prev => ({ ...prev, search }))}
            />
          </div>
          <CustomSelect
            value={filters.sortBy}
            onChange={v => setFilters(prev => ({ ...prev, sortBy: v as FilterState['sortBy'] }))}
            options={sortOptions}
            placeholder={t('inventory.sort')}
            className="sm:w-52"
          />
        </motion.div>

        {/* Mobile filter button */}
        <div className="lg:hidden">
          <InventoryFilters
            filters={filters}
            onChange={setFilters}
            resultCount={filtered.length}
          />
        </div>

        {/* Main layout: filters sidebar + grid */}
        <div className="flex gap-8">
          {/* Sidebar - desktop only */}
          <div className="hidden lg:block w-64 shrink-0">
            <InventoryFilters
              filters={filters}
              onChange={setFilters}
              resultCount={filtered.length}
            />
          </div>

          {/* Grid column */}
          <div className="flex-1 min-w-0">
            {/* Active Filter Chips */}
            <AnimatePresence mode="popLayout">
              {activeChips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-wrap items-center gap-2 mb-5"
                >
                  <AnimatePresence mode="popLayout">
                    {activeChips.map(chip => (
                      <motion.button
                        key={chip.key}
                        layout
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.15 }}
                        onClick={chip.onRemove}
                        className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-cc-red-subtle border border-cc-red/20 text-xs text-cc-red-light hover:bg-cc-red/15 hover:border-cc-red/30 transition-colors cursor-pointer"
                      >
                        <span>{chip.label}</span>
                        <X size={12} className="shrink-0 opacity-60" />
                      </motion.button>
                    ))}
                  </AnimatePresence>

                  {activeChips.length >= 2 && (
                    <motion.button
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={clearFilters}
                      className="text-xs text-cc-gray-400 hover:text-cc-red-light transition-colors cursor-pointer px-2 py-1.5"
                    >
                      {t('inventory.clearFilters')}
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <InventoryGrid vehicles={filtered} />
          </div>
        </div>
      </div>
    </div>
  )
}
