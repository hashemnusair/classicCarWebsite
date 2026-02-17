import { motion } from 'framer-motion'
import { MapPin, Phone, MessageCircle, Clock, ExternalLink } from 'lucide-react'
import SectionHeading from '../components/ui/SectionHeading'
import Button from '../components/ui/Button'
import { branches } from '../data/branches'
import { useLanguage } from '../context/LanguageContext'

export default function Branches() {
  const { lang, t } = useLanguage()

  return (
    <div className="pt-24 md:pt-32 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeading
          title={t('branches.title')}
          subtitle={t('branches.subtitle')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {branches.map((branch, i) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-card rounded-xl overflow-hidden"
            >
              {/* Map placeholder area */}
              <div className="relative h-48 bg-gradient-to-br from-cc-black-700 via-cc-black-600 to-cc-black-700 grid-pattern">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-cc-red/10 border border-cc-red/20">
                      <MapPin size={24} className="text-cc-red" />
                    </div>
                    <span className="font-display text-xs tracking-wider text-cc-gray-300">
                      {lang === 'ar' ? branch.nameAr : branch.nameEn}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8">
                <h3 className="font-display text-base tracking-wider text-cc-white mb-4">
                  {lang === 'ar' ? branch.nameAr : branch.nameEn}
                </h3>

                <div className="space-y-4 mb-6">
                  {/* Address */}
                  <div className="flex items-start gap-3 text-sm text-cc-gray-300">
                    <MapPin size={15} className="text-cc-red shrink-0 mt-0.5" />
                    <span>{lang === 'ar' ? branch.addressAr : branch.addressEn}</span>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-3 text-sm text-cc-gray-300">
                    <Clock size={15} className="text-cc-red shrink-0 mt-0.5" />
                    <span className="whitespace-pre-line">
                      {lang === 'ar' ? branch.hoursAr : branch.hoursEn}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-3 text-sm text-cc-gray-300">
                    <Phone size={15} className="text-cc-red shrink-0" />
                    <a href={`tel:${branch.phone}`} className="hover:text-cc-white transition-colors" dir="ltr">
                      {branch.phone}
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <a href={branch.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm" icon={<ExternalLink size={14} />}>
                      {t('branches.getDirections')}
                    </Button>
                  </a>
                  <a href={`tel:${branch.phone}`}>
                    <Button variant="ghost" size="sm" icon={<Phone size={14} />}>
                      {t('branches.callBranch')}
                    </Button>
                  </a>
                  <a
                    href={`https://wa.me/${branch.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm" icon={<MessageCircle size={14} />}>
                      {t('branches.whatsappBranch')}
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
