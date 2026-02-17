import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gauge, Calendar, Fuel } from 'lucide-react'
import type { Vehicle } from '../../types'
import { useLanguage } from '../../context/LanguageContext'

interface CarCardProps {
  vehicle: Vehicle
  index?: number
}

export default function CarCard({ vehicle, index = 0 }: CarCardProps) {
  const { lang, t } = useLanguage()

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`
  const fullTitle = vehicle.trim ? `${title} ${vehicle.trim}` : title

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link
        to={`/inventory/${vehicle.slug}`}
        className="group block rounded-lg overflow-hidden glass-card hover:scale-[1.01] transition-transform duration-500"
      >
        {/* Image */}
        <div
          className="relative aspect-[16/10] overflow-hidden"
          style={{ background: vehicle.images[0]?.url || 'var(--color-cc-black-700)' }}
        >
          {/* Overlay gradient */}
          <div className="car-image-overlay" />

          {/* Status badge */}
          {vehicle.status !== 'available' && (
            <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 z-10">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider rounded-sm ${
                vehicle.status === 'reserved'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                  : 'bg-cc-gray-400/20 text-cc-gray-300 border border-cc-gray-400/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  vehicle.status === 'reserved' ? 'bg-amber-400 pulse-dot' : 'bg-cc-gray-300'
                }`} />
                {t(`vehicle.${vehicle.status}`)}
              </span>
            </div>
          )}

          {/* Tags */}
          <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 z-10 flex flex-wrap gap-1.5">
            {vehicle.tags.slice(0, 3).map(tag => (
              <span key={tag} className="car-tag">{tag}</span>
            ))}
          </div>

          {/* Hover overlay with car silhouette icon */}
          <div className="absolute inset-0 bg-cc-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[1]" />
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="font-display text-sm tracking-wider text-cc-white group-hover:text-cc-red-light transition-colors duration-300 mb-1 line-clamp-1">
            {fullTitle}
          </h3>

          {/* Quick specs */}
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 text-cc-gray-300 text-xs">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-cc-gray-400" />
              {vehicle.year}
            </span>
            <span className="flex items-center gap-1.5">
              <Gauge size={13} className="text-cc-gray-400" />
              {vehicle.mileage.toLocaleString()} {t('vehicle.km')}
            </span>
            <span className="flex items-center gap-1.5">
              <Fuel size={13} className="text-cc-gray-400" />
              {t(`fuelTypes.${vehicle.fuelType}`)}
            </span>
          </div>

          {/* Price / CTA */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-cc-black-500/50">
            {vehicle.priceMode === 'show' && vehicle.price ? (
              <span className="text-cc-white font-semibold text-lg">
                {vehicle.price.toLocaleString(lang === 'ar' ? 'ar-JO' : 'en-JO')} JOD
              </span>
            ) : (
              <span className="text-cc-gray-300 text-xs tracking-wider uppercase">
                {t('inventory.priceOnRequest')}
              </span>
            )}
            <span className="text-cc-red text-xs font-medium tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 rtl:-translate-x-2 rtl:group-hover:translate-x-0">
              {t('home.viewDetails')} →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
