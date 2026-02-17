import SectionHeading from '../ui/SectionHeading'
import CarCard from '../ui/CarCard'
import type { Vehicle } from '../../types'
import { getSimilarVehicles } from '../../data/vehicles'
import { useLanguage } from '../../context/LanguageContext'

interface SimilarCarsProps {
  vehicle: Vehicle
}

export default function SimilarCars({ vehicle }: SimilarCarsProps) {
  const { t } = useLanguage()
  const similar = getSimilarVehicles(vehicle, 3)

  if (similar.length === 0) return null

  return (
    <section className="py-16">
      <SectionHeading title={t('vehicle.similar')} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {similar.map((v, i) => (
          <CarCard key={v.id} vehicle={v} index={i} />
        ))}
      </div>
    </section>
  )
}
