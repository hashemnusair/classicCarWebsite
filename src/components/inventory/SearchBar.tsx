import { Search, X } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const { t } = useLanguage()

  return (
    <div className="relative">
      <Search size={18} className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-cc-gray-400" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={t('inventory.search')}
        className="w-full bg-cc-black-700 border border-cc-black-500 rounded-lg pl-12 pr-10 rtl:pr-12 rtl:pl-10 py-3.5 text-sm text-cc-white placeholder:text-cc-gray-400 focus:outline-none focus:border-cc-red/40 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 rtl:right-auto rtl:left-4 top-1/2 -translate-y-1/2 text-cc-gray-400 hover:text-cc-white transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
