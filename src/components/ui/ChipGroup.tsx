import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export interface ChipOption {
  value: string
  label: string
  icon?: ReactNode
}

interface ChipGroupProps {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  options: ChipOption[]
  counts?: Record<string, number>
}

export default function ChipGroup({ label, value, onChange, options, counts }: ChipGroupProps) {
  function toggle(optValue: string) {
    if (value.includes(optValue)) {
      onChange(value.filter(v => v !== optValue))
    } else {
      onChange([...value, optValue])
    }
  }

  return (
    <div>
      <span className="block mb-3 text-[10px] font-display tracking-[0.15em] uppercase text-cc-gray-400">
        {label}
      </span>
      <div className="flex flex-wrap gap-x-3 gap-y-2.5">
        {options.map(opt => {
          const active = value.includes(opt.value)
          const count = counts?.[opt.value] ?? null
          const isZero = count === 0 && !active
          return (
            <motion.button
              key={opt.value}
              type="button"
              whileTap={isZero ? undefined : { scale: 0.95 }}
              onClick={() => { if (!isZero) toggle(opt.value) }}
              className={`
                inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs tracking-wider uppercase transition-colors
                ${isZero
                  ? 'bg-cc-black-700 border-cc-black-500 text-cc-gray-300 opacity-30 cursor-default'
                  : active
                    ? 'bg-cc-red-subtle border-cc-red/30 text-cc-red-light cursor-pointer'
                    : 'bg-cc-black-700 border-cc-black-500 text-cc-gray-300 hover:border-cc-gray-500 hover:text-cc-white cursor-pointer'
                }
              `}
            >
              {opt.icon && <span className="text-[14px] leading-none">{opt.icon}</span>}
              {opt.label}
              {count !== null && (
                <span className={`text-[10px] font-body tabular-nums ${active ? 'text-cc-red-light/60' : 'text-cc-gray-500'}`}>
                  {count}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
