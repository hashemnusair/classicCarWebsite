import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import Button from '../ui/Button'
import { useLanguage } from '../../context/LanguageContext'

export default function Hero() {
  const { t, lang } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const carX = useTransform(scrollYProgress, [0, 1], [0, 100])

  return (
    <section ref={ref} className="relative h-screen min-h-[700px] flex flex-col overflow-hidden">
      {/* Background */}
      <motion.div style={{ scale }} className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cc-black via-cc-black-800 to-cc-black" />
        <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-cc-red/[0.04] blur-[150px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-cc-red/[0.02] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] bg-cc-red/[0.01] blur-[200px] rounded-full" />
        <div className="absolute inset-0 grid-pattern opacity-40" />
      </motion.div>

      {/* Diagonal racing accent lines */}
      <div className="absolute top-0 right-[15%] w-[1px] h-full bg-gradient-to-b from-transparent via-cc-red/20 to-transparent transform rotate-[15deg] origin-top hidden lg:block" />
      <div className="absolute top-0 right-[16%] w-[1px] h-full bg-gradient-to-b from-transparent via-cc-red/8 to-transparent transform rotate-[15deg] origin-top hidden lg:block" />

      {/* Abstract car silhouette on right side - desktop only */}
      <motion.div
        style={{ x: carX }}
        className="absolute right-0 bottom-[15%] w-[55%] h-[40%] hidden lg:block pointer-events-none"
      >
        <motion.svg
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 0.04, x: 0 }}
          transition={{ duration: 1.5, delay: 1, ease: 'easeOut' }}
          viewBox="0 0 800 300"
          fill="none"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d="M50 230 Q80 230 120 225 L200 210 Q240 200 280 180 L350 150 Q380 135 420 125 L500 110 Q540 105 580 108 L650 115 Q690 120 720 135 L750 150 Q770 160 780 175 L785 200 Q785 220 770 230 L740 235 Q720 240 700 235 Q680 220 660 220 Q640 220 620 235 Q600 240 580 235 L280 235 Q260 240 240 235 Q220 220 200 220 Q180 220 160 235 Q140 240 120 235 L70 232 Q55 232 50 230 Z"
            fill="currentColor"
            className="text-cc-white"
          />
          <path
            d="M350 150 Q380 135 420 125 L500 110 Q530 105 550 108 L450 160 Q420 170 380 175 L350 150 Z"
            fill="currentColor"
            className="text-cc-red"
            opacity="0.3"
          />
        </motion.svg>
      </motion.div>

      {/* Horizontal speed lines */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 1 }}
        className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none"
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 60 + i * 30, opacity: 0.03 + i * 0.01 }}
            transition={{ delay: 1.5 + i * 0.1, duration: 0.8 }}
            className="h-[1px] bg-cc-red mb-6"
            style={{ marginRight: i * 20 }}
          />
        ))}
      </motion.div>

      {/* Main content area - grows to fill space above stats */}
      <motion.div style={{ opacity, y }} className="relative z-10 flex-1 flex items-center max-w-7xl mx-auto w-full px-4 md:px-6 pt-20">
        <div className="max-w-3xl">
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, x: lang === 'ar' ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="block w-10 h-[2px] bg-cc-red" />
            <span className="text-cc-red text-xs tracking-[0.3em] uppercase font-medium">
              {t('hero.tagline')}
            </span>
          </motion.div>

          {/* Main title - using Oxanium */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h1
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-normal tracking-wider leading-[0.9]"
              style={lang === 'en' ? { fontFamily: "'Orbitron', sans-serif", fontWeight: 500 } : undefined}
            >
              <span className="text-[#BF281F] block">{t('hero.title1')}</span>
              <span className="text-white block mt-1">{t('hero.title2')}</span>
            </h1>
          </motion.div>

          {/* Red accent line below title */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="h-[3px] bg-gradient-to-r from-cc-red to-transparent mt-6"
          />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-5 text-cc-gray-300 text-base md:text-lg leading-relaxed max-w-lg"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="flex flex-wrap items-center gap-4 mt-8"
          >
            <Link to="/inventory">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight size={16} />}
                iconPosition={lang === 'ar' ? 'left' : 'right'}
              >
                {t('hero.cta')}
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                {t('hero.ctaSecondary')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats strip - pinned to bottom, separate from content flow */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.2 }}
        className="relative z-10 hidden md:block"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-8 lg:gap-12 py-6 border-t border-white/[0.06]">
            <Stat number="30+" label={t('home.yearsInBusiness')} />
            <Stat number="5,000+" label={t('home.carsDelivered')} />
            <Stat number="4,200+" label={t('home.happyClients')} />
            <Stat number="2" label={t('home.branches')} />
          </div>
        </div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cc-black to-transparent pointer-events-none z-[5]" />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={20} className="text-cc-gray-400" />
        </motion.div>
      </motion.div>
    </section>
  )
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-display text-xl lg:text-2xl text-cc-red tracking-wider">{number}</span>
      <span className="text-cc-gray-400 text-[0.65rem] lg:text-xs tracking-wider uppercase">{label}</span>
    </div>
  )
}
