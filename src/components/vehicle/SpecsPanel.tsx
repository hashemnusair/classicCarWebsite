import { motion } from 'framer-motion'
import { Calendar, Gauge, Cog, Fuel, Palette, CircleDot, Car, Globe } from 'lucide-react'
import type { Vehicle } from '../../types'
import { useLanguage } from '../../context/LanguageContext'

interface SpecsPanelProps {
  vehicle: Vehicle
}

export default function SpecsPanel({ vehicle }: SpecsPanelProps) {
  const { t } = useLanguage()

  const specs = [
    { icon: Calendar, label: t('vehicle.year'), value: vehicle.year.toString() },
    { icon: Gauge, label: t('vehicle.mileage'), value: `${vehicle.mileage.toLocaleString()} ${t('vehicle.km')}` },
    { icon: Cog, label: t('vehicle.engine'), value: vehicle.engine },
    { icon: Car, label: t('vehicle.transmission'), value: t(`transmissions.${vehicle.transmission}`) },
    { icon: CircleDot, label: t('vehicle.drivetrain'), value: vehicle.drivetrain.toUpperCase() },
    { icon: Fuel, label: t('vehicle.fuelType'), value: t(`fuelTypes.${vehicle.fuelType}`) },
    { icon: Palette, label: t('vehicle.exteriorColor'), value: vehicle.exteriorColor },
    { icon: Palette, label: t('vehicle.interiorColor'), value: vehicle.interiorColor },
    { icon: Car, label: t('vehicle.bodyType'), value: t(`bodyTypes.${vehicle.bodyType}`) },
    { icon: Globe, label: t('vehicle.origin'), value: vehicle.origin === 'local' ? t('vehicle.local') : `${t('vehicle.imported')}${vehicle.importCountry ? ` — ${vehicle.importCountry}` : ''}` },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-xl p-6 md:p-8"
    >
      <h3 className="font-display text-sm tracking-[0.2em] uppercase text-cc-white mb-6 flex items-center gap-3">
        <span className="w-6 h-[2px] bg-cc-red" />
        {t('vehicle.specs')}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {specs.map((spec, i) => {
          const Icon = spec.icon
          return (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-cc-black-800/50 border border-white/[0.02]"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded bg-cc-red/10 shrink-0">
                <Icon size={14} className="text-cc-red" />
              </div>
              <div className="min-w-0">
                <p className="text-cc-gray-400 text-[0.7rem] tracking-wider uppercase mb-0.5">
                  {spec.label}
                </p>
                <p className="text-cc-white text-sm font-medium truncate">
                  {spec.value}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
