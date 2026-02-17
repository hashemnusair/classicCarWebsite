import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Phone, X } from 'lucide-react'
import { siteConfig } from '../../data/branches'
import { useLanguage } from '../../context/LanguageContext'

export default function FloatingCTA() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()

  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp.replace(/[^0-9]/g, '')}`

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 rtl:right-auto rtl:left-6">
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.a
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ delay: 0.1 }}
              href={`tel:${siteConfig.phone}`}
              className="flex items-center gap-3 rounded-full bg-cc-black-700 border border-cc-black-500 px-5 py-3 text-cc-white shadow-xl hover:bg-cc-black-600 transition-colors"
            >
              <Phone size={18} />
              <span className="text-sm font-medium">{t('common.call')}</span>
            </motion.a>
            <motion.a
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-full bg-[#25D366] px-5 py-3 text-white shadow-xl hover:bg-[#20BD5A] transition-colors"
            >
              <MessageCircle size={18} />
              <span className="text-sm font-medium">{t('common.whatsapp')}</span>
            </motion.a>
          </>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 cursor-pointer ${
          isOpen
            ? 'bg-cc-black-600 border border-cc-black-500'
            : 'bg-cc-red red-glow'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
