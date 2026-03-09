import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-9 w-full font-pixel text-[10px] disabled:cursor-not-allowed disabled:opacity-40',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'
