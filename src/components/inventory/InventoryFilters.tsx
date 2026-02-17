import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, Car, Truck, CarFront, Fuel, Leaf, Zap } from 'lucide-react'
import { useState, useMemo } from 'react'
import type { FilterState, Vehicle } from '../../types'
import { vehicles } from '../../data/vehicles'
import { getUniqueMakes, getModelsByMake } from '../../data/vehicles'
import { useLanguage } from '../../context/LanguageContext'
import CustomSelect from '../ui/CustomSelect'
import ChipGroup from '../ui/ChipGroup'
import RangeSlider from '../ui/RangeSlider'

interface InventoryFiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  resultCount: number
}

export default function InventoryFilters({ filters, onChange, resultCount }: InventoryFiltersProps) {
  const { t, lang } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)
  const makes = getUniqueMakes()
  const models = filters.make.length
    ? [...new Set(filters.make.flatMap(m => getModelsByMake(m)))].sort()
    : []

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const next = { ...filters, [key]: value }
    if (key === 'make') {
      // Prune model selections that no longer belong to any selected make
      const selectedMakes = value as string[]
      const validModels = new Set(selectedMakes.flatMap(m => getModelsByMake(m)))
      next.model = next.model.filter(m => validModels.has(m))
    }
    onChange(next)
  }

  const clearFilters = () => {
    onChange({
      search: filters.search,
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
  }

  const activeFilterCount =
    filters.make.length + filters.model.length + filters.bodyType.length +
    filters.fuelType.length + filters.transmission.length + filters.origin.length +
    (filters.yearMin !== null || filters.yearMax !== null ? 1 : 0) +
    (filters.mileageMin !== null || filters.mileageMax !== null ? 1 : 0) +
    (filters.priceMin !== null || filters.priceMax !== null ? 1 : 0)

  const hasActiveFilters = activeFilterCount > 0
  const formatNumber = (value: number) => value.toLocaleString(lang === 'ar' ? 'ar-JO' : 'en-US')

  // Compute data-driven bounds from vehicle data
  const bounds = useMemo(() => {
    const available = vehicles.filter(v => v.status !== 'sold')
    const years = available.map(v => v.year)
    const mileages = available.map(v => v.mileage)
    const prices = available.filter(v => v.price != null).map(v => v.price!)
    return {
      yearMin: Math.min(...years),
      yearMax: Math.max(...years),
      mileageMin: Math.min(...mileages),
      mileageMax: Math.max(...mileages),
      priceMin: prices.length ? Math.min(...prices) : 0,
      priceMax: prices.length ? Math.max(...prices) : 100000,
    }
  }, [])

  // Faceted counts: for each category, apply all OTHER filters then count by value
  const filterCounts = useMemo(() => {
    const all = vehicles.filter(v => v.status !== 'sold')

    function applyBase(items: Vehicle[]) {
      let result = items
      if (filters.search) {
        const q = filters.search.toLowerCase()
        result = result.filter(v =>
          `${v.make} ${v.model} ${v.trim} ${v.year} ${v.tags.join(' ')}`.toLowerCase().includes(q)
        )
      }
      if (filters.yearMin) result = result.filter(v => v.year >= filters.yearMin!)
      if (filters.yearMax) result = result.filter(v => v.year <= filters.yearMax!)
      if (filters.mileageMin) result = result.filter(v => v.mileage >= filters.mileageMin!)
      if (filters.mileageMax) result = result.filter(v => v.mileage <= filters.mileageMax!)
      if (filters.priceMin) result = result.filter(v => v.price != null && v.price >= filters.priceMin!)
      if (filters.priceMax) result = result.filter(v => v.price != null && v.price <= filters.priceMax!)
      return result
    }

    function applyCategories(items: Vehicle[], exclude: string) {
      let result = items
      if (exclude !== 'make' && filters.make.length)
        result = result.filter(v => filters.make.includes(v.make))
      if (exclude !== 'model' && filters.model.length)
        result = result.filter(v => filters.model.includes(v.model))
      if (exclude !== 'bodyType' && filters.bodyType.length)
        result = result.filter(v => filters.bodyType.includes(v.bodyType))
      if (exclude !== 'fuelType' && filters.fuelType.length)
        result = result.filter(v => filters.fuelType.includes(v.fuelType))
      if (exclude !== 'transmission' && filters.transmission.length)
        result = result.filter(v => filters.transmission.includes(v.transmission))
      if (exclude !== 'origin' && filters.origin.length)
        result = result.filter(v => filters.origin.includes(v.origin))
      return result
    }

    function countField(items: Vehicle[], field: keyof Vehicle): Record<string, number> {
      const counts: Record<string, number> = {}
      for (const v of items) {
        const val = String(v[field])
        counts[val] = (counts[val] || 0) + 1
      }
      return counts
    }

    const base = applyBase(all)

    return {
      make: countField(applyCategories(base, 'make'), 'make'),
      model: countField(applyCategories(base, 'model'), 'model'),
      bodyType: countField(applyCategories(base, 'bodyType'), 'bodyType'),
      fuelType: countField(applyCategories(base, 'fuelType'), 'fuelType'),
      transmission: countField(applyCategories(base, 'transmission'), 'transmission'),
      origin: countField(applyCategories(base, 'origin'), 'origin'),
    }
  }, [filters])

  // Build option arrays
  const makeOptions = makes.map(m => ({ value: m, label: m }))
  const modelOptions = models.map(m => ({ value: m, label: m }))

  const bodyTypeOptions = [
    { value: 'sedan', label: t('bodyTypes.sedan'), icon: <Car size={14} /> },
    { value: 'suv', label: t('bodyTypes.suv'), icon: <Truck size={14} /> },
    { value: 'coupe', label: t('bodyTypes.coupe'), icon: <CarFront size={14} /> },
    { value: 'convertible', label: t('bodyTypes.convertible'), icon: <Car size={14} /> },
  ]

  const fuelTypeOptions = [
    { value: 'gasoline', label: t('fuelTypes.gasoline'), icon: <Fuel size={14} /> },
    { value: 'diesel', label: t('fuelTypes.diesel'), icon: <Fuel size={14} /> },
    { value: 'hybrid', label: t('fuelTypes.hybrid'), icon: <Leaf size={14} /> },
    { value: 'electric', label: t('fuelTypes.electric'), icon: <Zap size={14} /> },
  ]

  const transmissionOptions = [
    { value: 'automatic', label: t('transmissions.automatic') },
    { value: 'manual', label: t('transmissions.manual') },
  ]

  const originOptions = [
    { value: 'local', label: t('vehicle.local') },
    { value: 'imported', label: t('vehicle.imported') },
  ]

  const divider = (
    <div className="border-t border-cc-black-500/50 my-1" />
  )

  const filterContent = (
    <div className="space-y-7">
      {/* Make */}
      <CustomSelect
        multi
        value={filters.make}
        onChange={v => updateFilter('make', v)}
        options={makeOptions}
        placeholder={t('inventory.allMakes')}
        counts={filterCounts.make}
      />

      {/* Model — animated reveal when make selected */}
      <AnimatePresence>
        {filters.make.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CustomSelect
              multi
              value={filters.model}
              onChange={v => updateFilter('model', v)}
              options={modelOptions}
              placeholder={t('inventory.allModels')}
              counts={filterCounts.model}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {divider}

      {/* Body Type */}
      <ChipGroup
        label={t('inventory.bodyType')}
        value={filters.bodyType}
        onChange={v => updateFilter('bodyType', v)}
        options={bodyTypeOptions}
        counts={filterCounts.bodyType}
      />

      {/* Fuel Type */}
      <ChipGroup
        label={t('inventory.fuelType')}
        value={filters.fuelType}
        onChange={v => updateFilter('fuelType', v)}
        options={fuelTypeOptions}
        counts={filterCounts.fuelType}
      />

      {/* Transmission */}
      <ChipGroup
        label={t('inventory.transmission')}
        value={filters.transmission}
        onChange={v => updateFilter('transmission', v)}
        options={transmissionOptions}
        counts={filterCounts.transmission}
      />

      {/* Origin */}
      <ChipGroup
        label={t('inventory.origin')}
        value={filters.origin}
        onChange={v => updateFilter('origin', v)}
        options={originOptions}
        counts={filterCounts.origin}
      />

      {divider}

      {/* Year Range */}
      <RangeSlider
        label={t('inventory.yearRange')}
        min={bounds.yearMin}
        max={bounds.yearMax}
        valueMin={filters.yearMin}
        valueMax={filters.yearMax}
        step={1}
        onChange={(vMin, vMax) => onChange({ ...filters, yearMin: vMin, yearMax: vMax })}
      />

      {/* Mileage Range */}
      <RangeSlider
        label={t('inventory.mileageRange')}
        unit="KM"
        min={bounds.mileageMin}
        max={bounds.mileageMax}
        valueMin={filters.mileageMin}
        valueMax={filters.mileageMax}
        step={1000}
        onChange={(vMin, vMax) => onChange({ ...filters, mileageMin: vMin, mileageMax: vMax })}
        formatValue={formatNumber}
      />

      {/* Price Range — only show if any vehicles have prices */}
      {bounds.priceMax > 0 && (
        <RangeSlider
          label={t('inventory.priceRange')}
          unit="JOD"
          min={bounds.priceMin}
          max={bounds.priceMax}
          valueMin={filters.priceMin}
          valueMax={filters.priceMax}
          step={1000}
          onChange={(vMin, vMax) => onChange({ ...filters, priceMin: vMin, priceMax: vMax })}
          formatValue={formatNumber}
        />
      )}

      {/* Clear All */}
      {hasActiveFilters && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={clearFilters}
          className="w-full py-2.5 text-xs tracking-wider uppercase text-cc-red-light hover:text-cc-red border border-cc-red/20 rounded-lg hover:bg-cc-red/5 transition-colors cursor-pointer"
        >
          {t('inventory.clearFilters')}
        </motion.button>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xs tracking-[0.2em] uppercase text-cc-white flex items-center gap-2">
              <SlidersHorizontal size={14} />
              {t('inventory.filters')}
            </h3>
            <span className="text-xs text-cc-gray-400">
              {resultCount} {t('inventory.results')}
            </span>
          </div>
          {filterContent}
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-cc-black-700 border border-cc-black-500 text-sm text-cc-white cursor-pointer"
        >
          <SlidersHorizontal size={16} />
          {t('inventory.filters')}
          {activeFilterCount > 0 && (
            <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-cc-red text-cc-white text-[10px] font-bold px-1.5">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              onClick={e => e.stopPropagation()}
              className="absolute right-0 rtl:right-auto rtl:left-0 top-0 bottom-0 w-80 bg-cc-black-800 border-l rtl:border-l-0 rtl:border-r border-cc-black-500 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-display text-xs tracking-[0.2em] uppercase text-cc-white">
                  {t('inventory.filters')}
                </h3>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-cc-gray-400 hover:text-cc-white cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              {filterContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
