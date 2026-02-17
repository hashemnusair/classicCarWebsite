import { motion } from 'framer-motion'
import { Shield, Heart, Eye, Award } from 'lucide-react'
import SectionHeading from '../components/ui/SectionHeading'
import { useLanguage } from '../context/LanguageContext'

const values = [
  { icon: Award, titleKey: 'about.value1', descKey: 'about.value1Desc' },
  { icon: Eye, titleKey: 'about.value2', descKey: 'about.value2Desc' },
  { icon: Heart, titleKey: 'about.value3', descKey: 'about.value3Desc' },
  { icon: Shield, titleKey: 'about.value4', descKey: 'about.value4Desc' },
]

export default function About() {
  const { t } = useLanguage()

  return (
    <div className="pt-24 md:pt-32 pb-20 min-h-screen">
      {/* Hero area */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-cc-black via-cc-black-900 to-cc-black" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-cc-red/[0.02] blur-[150px]" />
        <div className="absolute inset-0 grid-pattern opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeading
            title={t('about.title')}
            subtitle={t('about.subtitle')}
          />
        </div>
      </section>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {['about.story1', 'about.story2', 'about.story3'].map((key, i) => (
            <motion.p
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-cc-gray-300 text-base leading-[1.9] text-center"
            >
              {t(key)}
            </motion.p>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-16 bg-cc-black-900">
        <div className="section-divider mb-16" />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '30+', label: t('home.yearsInBusiness') },
              { number: '5,000+', label: t('home.carsDelivered') },
              { number: '4,200+', label: t('home.happyClients') },
              { number: '2', label: t('home.branches') },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <span className="font-display text-3xl md:text-4xl text-cc-red tracking-wider block mb-2">
                  {stat.number}
                </span>
                <span className="text-cc-gray-400 text-xs tracking-wider uppercase">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="section-divider mt-16" />
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-[2px] bg-cc-red" />
            <span className="text-cc-red text-xs tracking-[0.3em] uppercase font-medium">
              {t('about.mission')}
            </span>
            <span className="w-8 h-[2px] bg-cc-red" />
          </div>
          <p className="text-cc-gray-200 text-lg md:text-xl leading-relaxed italic">
            "{t('about.missionText')}"
          </p>
        </motion.div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
        <SectionHeading title={t('about.values')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
          {values.map((value, i) => {
            const Icon = value.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-8 rounded-xl glass-card"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-cc-red/10 border border-cc-red/10 mx-auto mb-5">
                  <Icon size={24} className="text-cc-red" />
                </div>
                <h3 className="font-display text-sm tracking-wider text-cc-white mb-2">
                  {t(value.titleKey)}
                </h3>
                <p className="text-cc-gray-400 text-sm">
                  {t(value.descKey)}
                </p>
              </motion.div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
