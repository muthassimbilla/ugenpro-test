import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden group",
  {
    variants: {
      variant: {
        default: [
          "bg-[#2B7FFF]",
          "text-white shadow-lg shadow-[#2B7FFF]/25",
          "hover:shadow-xl hover:shadow-[#2B7FFF]/40",
          "hover:bg-[#1a6bff]",
          "border border-[#2B7FFF]/20",
          "backdrop-blur-sm",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0",
          "before:translate-x-[-100%] before:group-hover:translate-x-[100%] before:transition-transform before:duration-700",
          "after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/5 after:to-transparent after:opacity-0 after:group-hover:opacity-100 after:transition-opacity after:duration-300"
        ],
        destructive: [
          "bg-gradient-to-r from-red-600 via-red-700 to-rose-700",
          "text-white shadow-lg shadow-red-500/25",
          "hover:shadow-xl hover:shadow-red-500/40",
          "hover:from-red-500 hover:via-red-600 hover:to-rose-600",
          "border border-red-500/20",
          "backdrop-blur-sm",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0",
          "before:translate-x-[-100%] before:group-hover:translate-x-[100%] before:transition-transform before:duration-700"
        ],
        outline: [
          "border-2 border-slate-200/60 dark:border-slate-700/60",
          "bg-white/50 dark:bg-slate-900/50",
          "backdrop-blur-md",
          "text-slate-700 dark:text-slate-300",
          "hover:bg-white/80 dark:hover:bg-slate-800/80",
          "hover:border-slate-300/80 dark:hover:border-slate-600/80",
          "hover:shadow-lg hover:shadow-slate-500/10",
          "before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-r before:from-transparent before:via-slate-200/20 before:to-transparent dark:before:via-slate-700/20",
          "before:translate-x-[-100%] before:group-hover:translate-x-[100%] before:transition-transform before:duration-500"
        ],
        secondary: [
          "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800",
          "text-slate-700 dark:text-slate-300",
          "backdrop-blur-sm border border-slate-300/30 dark:border-slate-600/30",
          "hover:from-slate-50 hover:via-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:via-slate-600 dark:hover:to-slate-700",
          "hover:shadow-lg hover:shadow-slate-500/20",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/20 before:to-white/0 dark:before:via-slate-400/10",
          "before:translate-x-[-100%] before:group-hover:translate-x-[100%] before:transition-transform before:duration-600"
        ],
        ghost: [
          "text-slate-600 dark:text-slate-400",
          "hover:bg-slate-100/80 dark:hover:bg-slate-800/80",
          "hover:text-slate-700 dark:hover:text-slate-300",
          "backdrop-blur-sm",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-slate-200/30 before:to-transparent dark:before:via-slate-700/30",
          "before:scale-x-0 before:group-hover:scale-x-100 before:transition-transform before:duration-300 before:origin-center"
        ],
        link: [
          "text-blue-600 dark:text-blue-400",
          "underline-offset-4 hover:underline",
          "relative",
          "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-blue-600 after:to-indigo-600",
          "hover:after:w-full after:transition-all after:duration-300"
        ],
      },
      size: {
        default: "h-10 px-4 py-2 rounded-lg",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp 
        className={cn(buttonVariants({ variant, size }), className)} 
        ref={ref} 
        {...props}
      >
        {/* Liquid Glass Effect Layers */}
        {variant === "default" && (
          <>
            {/* Floating orb effect */}
            <div className="absolute top-1/2 left-1/2 w-0 h-0 bg-white/20 rounded-full group-hover:w-12 group-hover:h-12 group-hover:-translate-x-6 group-hover:-translate-y-6 transition-all duration-500 blur-md"></div>
            
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-active:opacity-100 group-active:animate-pulse transition-opacity duration-150"></div>
          </>
        )}
        
        {/* Content with glass reflection */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
        
        {/* Glass shine effect */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-[inherit] opacity-60"></div>
        
        {/* Bottom subtle shadow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-black/10 rounded-full blur-sm opacity-50"></div>
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
