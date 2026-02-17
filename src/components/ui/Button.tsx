import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, iconPosition = 'left', children, className = '', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 cursor-pointer select-none'

    const variants = {
      primary: 'bg-cc-red hover:bg-cc-red-light text-white shadow-lg shadow-cc-red/20 hover:shadow-cc-red/30',
      secondary: 'bg-cc-black-600 hover:bg-cc-black-500 text-cc-white border border-cc-black-500 hover:border-cc-gray-400',
      ghost: 'bg-transparent hover:bg-cc-black-700 text-cc-gray-200 hover:text-cc-white',
      outline: 'bg-transparent border border-cc-red/40 text-cc-red-light hover:bg-cc-red/10 hover:border-cc-red',
    }

    const sizes = {
      sm: 'px-4 py-2 text-xs tracking-wider',
      md: 'px-6 py-3 text-sm tracking-wider',
      lg: 'px-8 py-4 text-sm tracking-widest',
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
export default Button
