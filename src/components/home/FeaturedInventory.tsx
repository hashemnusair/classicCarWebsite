import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import CarCard from '../ui/CarCard'
import Button from '../ui/Button'
import { getFeaturedVehicles } from '../../data/vehicles'
import { useLanguage } from '../../context/LanguageContext'

export default function FeaturedInventory() {
  const { t, lang } = useLanguage()
  const featured = getFeaturedVehicles().slice(0, 6)
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -50])

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 overflow-hidden">
      {/* Background accent */}
      <motion.div
        style={{ y: bgY }}
        className="absolute top-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-cc-red/[0.015] blur-[120px] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeading
          title={t('home.featured')}
          subtitle={t('home.featuredSub')}
        />

        {/* Car Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((vehicle, i) => (
            <CarCard key={vehicle.id} vehicle={vehicle} index={i} />
          ))}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-14 text-center"
        >
          <Link to="/inventory">
            <Button
              variant="outline"
              size="lg"
              icon={<ArrowRight size={16} />}
              iconPosition={lang === 'ar' ? 'left' : 'right'}
            >
              {t('home.viewAll')}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
