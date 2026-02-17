import { motion } from 'framer-motion'
import { Shield, Globe, Star, Headphones } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import { useLanguage } from '../../context/LanguageContext'

const features = [
  { icon: Shield, titleKey: 'home.quality', descKey: 'home.qualityDesc' },
  { icon: Globe, titleKey: 'home.sourcing', descKey: 'home.sourcingDesc' },
  { icon: Star, titleKey: 'home.experience', descKey: 'home.experienceDesc' },
  { icon: Headphones, titleKey: 'home.support', descKey: 'home.supportDesc' },
]

export default function BrandProof() {
  const { t } = useLanguage()

  return (
    <section className="relative py-24 md:py-32 bg-cc-black-900">
      {/* Top divider */}
      <div className="section-divider" />

      {/* Grid background */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-8">
        <SectionHeading
          title={t('home.brandPromise')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.titleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative p-8 rounded-lg glass-card racing-stripe"
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-cc-red/10 border border-cc-red/10 mb-6 group-hover:bg-cc-red/15 transition-colors duration-500">
                  <Icon size={22} className="text-cc-red" />
                </div>

                {/* Content */}
                <h3 className="font-display text-sm tracking-wider text-cc-white mb-3">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-cc-gray-400 text-sm leading-relaxed">
                  {t(feature.descKey)}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Bottom divider */}
      <div className="section-divider mt-24" />
    </section>
  )
}
