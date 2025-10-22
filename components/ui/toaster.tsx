"use client"

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  // Icon mapping for different toast types
  const getToastIcon = (variant: string) => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 drop-shadow-sm" />
      case "destructive":
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 drop-shadow-sm" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 drop-shadow-sm" />
      default:
        return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 drop-shadow-sm" />
    }
  }

  return (
    <ToastProvider>
      {/* Removed background blur effects for unnoticeable toasts */}

      {toasts.map(({ id, title, description, action, variant = "default", ...props }, index) => (
        <Toast key={id} variant={variant} duration={3000} {...props}>
          {/* Toast content wrapper with enhanced layout */}
          <div className="flex items-start space-x-3 w-full">
            {/* Simple icon without effects */}
            <div className="flex-shrink-0 mt-0.5">
              {getToastIcon(variant)}
            </div>

            {/* Content area */}
            <div className="flex-1 grid gap-1 min-w-0">
              {title && (
                <ToastTitle>
                  {title}
                </ToastTitle>
              )}
              {description && <ToastDescription className="pr-2">{description}</ToastDescription>}
            </div>
          </div>

          {/* Action button if provided */}
          {action && <div className="flex-shrink-0 ml-3">{action}</div>}

          {/* Enhanced close button */}
          <ToastClose />

          {/* Stacking effect for multiple toasts */}
          {index > 0 && (
            <div
              className="absolute inset-0 -z-10 rounded-2xl bg-current/5 backdrop-blur-sm"
              style={{
                transform: `translateY(${index * 4}px) scale(${1 - index * 0.02})`,
                opacity: Math.max(0.3, 1 - index * 0.2),
              }}
            />
          )}

          {/* Liquid animation on appear */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 animate-in slide-in-from-right-full duration-500" />

          {/* Subtle pulsing border for active state */}
          <div className="absolute inset-0 rounded-2xl border border-current/10 animate-pulse opacity-50" />
        </Toast>
      ))}

      <ToastViewport />

      {/* Custom CSS animations */}
      <style jsx global>{`
        @keyframes progress-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes liquid-wave {
          0%, 100% { 
            transform: translateX(-100%) skewX(0deg); 
          }
          50% { 
            transform: translateX(100%) skewX(-15deg); 
          }
        }
        
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0px);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px);
          }
        }
        
        .animate-liquid-wave {
          animation: liquid-wave 2s ease-in-out infinite;
        }
        
        .animate-float-up {
          animation: float-up 1.5s ease-out forwards;
        }
        
        /* Enhanced toast stacking */
        .toast-stack-1 {
          transform: translateY(4px) scale(0.98);
          opacity: 0.9;
        }
        
        .toast-stack-2 {
          transform: translateY(8px) scale(0.96);
          opacity: 0.7;
        }
        
        .toast-stack-3 {
          transform: translateY(12px) scale(0.94);
          opacity: 0.5;
        }
        
        /* Smooth toast entry with liquid effect */
        .toast-enter {
          animation: 
            slide-in-from-right-full 0.3s cubic-bezier(0.16, 1, 0.3, 1),
            scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }
        
        @keyframes scale-in {
          from { transform: scale(0.95); }
          to { transform: scale(1); }
        }
        
        /* Liquid glass reflection effect */
        .glass-reflection {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.05) 25%,
            rgba(255, 255, 255, 0.02) 50%,
            rgba(255, 255, 255, 0.05) 75%,
            rgba(255, 255, 255, 0.1) 100%
          );
        }
      `}</style>
    </ToastProvider>
  )
}
