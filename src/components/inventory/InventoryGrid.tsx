import { motion } from 'framer-motion'
import { SearchX } from 'lucide-react'
import type { Vehicle } from '../../types'
import CarCard from '../ui/CarCard'
import { useLanguage } from '../../context/LanguageContext'

interface InventoryGridProps {
  vehicles: Vehicle[]
}

export default function InventoryGrid({ vehicles }: InventoryGridProps) {
  const { t } = useLanguage()

  if (vehicles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-cc-black-700 border border-cc-black-500 mb-6">
          <SearchX size={28} className="text-cc-gray-400" />
        </div>
        <h3 className="font-display text-lg tracking-wider text-cc-white mb-2">
          {t('inventory.noResults')}
        </h3>
        <p className="text-cc-gray-400 text-sm">
          {t('inventory.noResultsSub')}
        </p>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {vehicles.map((vehicle, i) => (
        <CarCard key={vehicle.id} vehicle={vehicle} index={i} />
      ))}
    </div>
  )
}
