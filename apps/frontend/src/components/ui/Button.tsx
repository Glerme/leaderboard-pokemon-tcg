import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-pixel transition-all duration-75 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 active:translate-y-[2px] cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-pokemon-yellow text-pokemon-darker border-2 border-black shadow-pixel hover:bg-pokemon-yellow-dark active:shadow-none',
        destructive:
          'bg-pokemon-red text-white border-2 border-black shadow-pixel-red hover:bg-pokemon-red-dark active:shadow-none',
        outline:
          'bg-transparent text-pokemon-yellow border-2 border-pokemon-yellow shadow-pixel-yellow hover:bg-pokemon-yellow hover:text-pokemon-darker active:shadow-none',
        secondary:
          'bg-pokemon-gray text-pokemon-light border-2 border-pokemon-gray-light shadow-pixel hover:bg-pokemon-gray-light active:shadow-none',
        success:
          'bg-pokemon-green text-white border-2 border-black shadow-pixel hover:bg-pokemon-green-dark active:shadow-none',
        ghost:
          'bg-transparent text-pokemon-light border-2 border-transparent hover:border-pokemon-gray-light hover:bg-pokemon-gray active:shadow-none',
      },
      size: {
        default: 'h-9 px-4 py-2 text-[10px]',
        sm: 'h-7 px-3 py-1 text-[9px]',
        lg: 'h-11 px-6 py-3 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
)
Button.displayName = 'Button'
