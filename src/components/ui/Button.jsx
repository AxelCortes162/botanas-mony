// src/components/ui/Button.jsx
import { cn } from '../../lib/format'

const VARIANTS = {
  primary: 'bg-brand-600 text-white shadow-glow hover:bg-brand-700',
  secondary: 'bg-white text-ink border-2 border-line hover:bg-cream',
  whatsapp: 'bg-[#25D366] text-white shadow-[0_8px_24px_rgb(37,211,102,0.35)] hover:bg-[#1eb257]',
  danger: 'bg-chili-500 text-white hover:bg-chili-600',
  ghost: 'bg-transparent text-ink-soft hover:bg-cream-deep',
}

const SIZES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-3 text-[0.95rem]',
  lg: 'px-6 py-4 text-base',
}

const Button = ({
  variant = 'primary',
  size = 'md',
  className,
  full,
  type = 'button',
  children,
  ...props
}) => (
  <button
    type={type}
    className={cn(
      'no-tap-highlight inline-flex items-center justify-center gap-2 rounded-full font-extrabold transition duration-200',
      'active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
      VARIANTS[variant],
      SIZES[size],
      full && 'w-full',
      className,
    )}
    {...props}
  >
    {children}
  </button>
)

export default Button
