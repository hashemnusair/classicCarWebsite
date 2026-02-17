import { useState, useRef, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { useClickOutside } from '../../hooks/useClickOutside'

export interface SelectOption {
  value: string
  label: string
  icon?: ReactNode
}

interface CustomSelectBaseProps {
  options: SelectOption[]
  placeholder: string
  className?: string
  counts?: Record<string, number>
}

interface SingleSelectProps extends CustomSelectBaseProps {
  multi?: false
  value: string
  onChange: (value: string) => void
}

interface MultiSelectProps extends CustomSelectBaseProps {
  multi: true
  value: string[]
  onChange: (value: string[]) => void
}

type CustomSelectProps = SingleSelectProps | MultiSelectProps

export default function CustomSelect(props: CustomSelectProps) {
  const { options, placeholder, className = '', counts, multi } = props
  const [open, setOpen] = useState(false)
  const [focusIndex, setFocusIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    setFocusIndex(-1)
  }, [])

  useClickOutside(containerRef, close, open)

  // Determine selected values as array for unified logic
  const selectedValues: string[] = multi ? props.value : (props.value ? [props.value] : [])

  function isSelected(value: string) {
    return selectedValues.includes(value)
  }

  function handleSelect(value: string) {
    if (multi) {
      const onChange = props.onChange as (v: string[]) => void
      if (value === '') {
        // "All" option — clear selection
        onChange([])
        close()
      } else {
        const next = isSelected(value)
          ? selectedValues.filter(v => v !== value)
          : [...selectedValues, value]
        onChange(next)
        // Keep dropdown open in multi mode
      }
    } else {
      const onChange = props.onChange as (v: string) => void
      onChange(value)
      close()
    }
  }

  // Build display label for the trigger
  function getTriggerLabel(): string {
    if (selectedValues.length === 0) return placeholder
    if (selectedValues.length === 1) {
      return options.find(o => o.value === selectedValues[0])?.label ?? selectedValues[0]
    }
    const firstName = options.find(o => o.value === selectedValues[0])?.label ?? selectedValues[0]
    return `${firstName} +${selectedValues.length - 1}`
  }

  const triggerLabel = getTriggerLabel()
  const hasSelection = selectedValues.length > 0

  // For single-select, prepend the "All" option
  const allOptions: SelectOption[] = multi
    ? [{ value: '', label: placeholder }, ...options]
    : [{ value: '', label: placeholder }, ...options]

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!open) {
          setOpen(true)
          setFocusIndex(0)
        } else if (focusIndex >= 0) {
          handleSelect(allOptions[focusIndex].value)
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!open) {
          setOpen(true)
          setFocusIndex(0)
        } else {
          setFocusIndex(i => Math.min(i + 1, allOptions.length - 1))
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (open) {
          setFocusIndex(i => Math.max(i - 1, 0))
        }
        break
      case 'Escape':
        e.preventDefault()
        close()
        break
    }
  }

  const scrollToIndex = (index: number) => {
    if (listRef.current) {
      const item = listRef.current.children[index] as HTMLElement | undefined
      item?.scrollIntoView({ block: 'nearest' })
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          setOpen(prev => !prev)
          if (!open) setFocusIndex(0)
        }}
        onKeyDown={handleKeyDown}
        className={`
          w-full flex items-center justify-between rounded-lg px-4 py-3 text-sm
          focus:outline-none transition-colors cursor-pointer
          ${hasSelection
            ? 'bg-cc-black-700 border border-cc-red/30 text-cc-white'
            : 'bg-cc-black-700 border border-cc-black-500 text-cc-gray-300'
          }
        `}
      >
        <span className={`truncate ${hasSelection ? 'text-cc-white' : 'text-cc-gray-300'}`}>
          {triggerLabel}
        </span>
        <div className="flex items-center gap-1.5 shrink-0 ltr:ml-2 rtl:mr-2">
          {multi && selectedValues.length > 0 && (
            <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-cc-red/20 text-cc-red-light text-[10px] font-bold px-1.5">
              {selectedValues.length}
            </span>
          )}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.15 }}
            className="text-cc-gray-400"
          >
            <ChevronDown size={16} />
          </motion.span>
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            role="listbox"
            aria-multiselectable={multi || undefined}
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1.5 w-full max-h-56 overflow-y-auto rounded-lg border border-cc-black-500 bg-cc-black-700/95 backdrop-blur-md shadow-xl shadow-black/40"
          >
            {allOptions.map((opt, i) => {
              const selected = opt.value === '' ? selectedValues.length === 0 : isSelected(opt.value)
              const isFocused = i === focusIndex
              const count = opt.value && counts ? counts[opt.value] ?? 0 : null
              const isZero = count === 0 && !selected

              return (
                <li
                  key={opt.value || '__all__'}
                  role="option"
                  aria-selected={selected}
                  className={`
                    flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors
                    ${isZero ? 'opacity-40 cursor-default' : 'cursor-pointer'}
                    ${isFocused && !isZero ? 'bg-cc-red/10' : (!isZero ? 'hover:bg-cc-red/10' : '')}
                    ${selected && opt.value !== '' ? 'text-cc-red-light' : 'text-cc-gray-100'}
                  `}
                  onPointerEnter={() => setFocusIndex(i)}
                  onPointerDown={(e) => {
                    e.preventDefault()
                    if (!isZero) handleSelect(opt.value)
                  }}
                  ref={() => { if (isFocused) scrollToIndex(i) }}
                >
                  {/* Checkbox for multi mode */}
                  {multi && opt.value !== '' && (
                    <span className={`
                      w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors
                      ${selected
                        ? 'bg-cc-red border-cc-red'
                        : 'border-cc-gray-500 bg-transparent'
                      }
                    `}>
                      {selected && <Check size={10} className="text-white" strokeWidth={3} />}
                    </span>
                  )}
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <span className="flex-1 truncate">{opt.label}</span>
                  {count !== null && (
                    <span className={`text-xs tabular-nums shrink-0 ${selected ? 'text-cc-red-light/70' : 'text-cc-gray-500'}`}>
                      {count}
                    </span>
                  )}
                  {/* Red dot for single-select selected item */}
                  {!multi && selected && opt.value !== '' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cc-red shrink-0" />
                  )}
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
