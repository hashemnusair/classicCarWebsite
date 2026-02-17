import { motion } from 'framer-motion'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  accent?: boolean
}

export default function SectionHeading({ title, subtitle, align = 'center', accent = true }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className={`mb-12 ${align === 'center' ? 'text-center' : 'text-start'}`}
    >
      {accent && (
        <div className={`flex items-center gap-3 mb-4 ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
          <span className="block w-8 h-[2px] bg-cc-red" />
          <span className="block w-2 h-2 rounded-full bg-cc-red" />
          <span className="block w-8 h-[2px] bg-cc-red" />
        </div>
      )}
      <h2 className="font-display text-2xl md:text-3xl lg:text-4xl tracking-wider text-cc-white">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-cc-gray-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
