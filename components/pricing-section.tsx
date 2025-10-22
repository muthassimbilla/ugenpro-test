"use client"

import { useRouter } from "next/navigation"
import { pricingPlans } from "@/lib/pricing-data"
import { useState } from "react"
import EnhancedPurchaseModal from "@/components/enhanced-purchase-modal"

export function PricingSection() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string
    name: string
    price: string
    duration: string
  } | null>(null)

  const handleSelectPlan = (planId: string) => {
    const plan = pricingPlans.find((p) => p.id === planId)
    if (plan) {
      setSelectedPlan({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        duration: plan.duration,
      })
      setIsModalOpen(true)
    }
  }

  return (
    <section id="pricing" className="relative py-12 overflow-hidden bg-white dark:bg-slate-900">
      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center mb-8 px-4 sm:px-0">
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full glass shadow-sm border border-primary/20 text-xs sm:text-sm font-bold mb-4 transition-all duration-300 hover:scale-[1.02]">
            <span className="text-2xl">💰</span>
            <span className="text-primary font-bold">Pricing Plans</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-balance">
            <span className="text-shadow-lg">Simple, </span>
            <span className="text-primary text-shadow-lg">transparent pricing</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-balance max-w-2xl mx-auto">
            Choose the perfect plan for your needs. Premium tools for professional results.
          </p>
        </div>

        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto px-4 sm:px-0">
            {pricingPlans.map((plan) => (
              <div key={plan.id} className="group h-full">
                <div
                  className={`h-full rounded-2xl bg-card border shadow-lg transition-all duration-300 overflow-hidden flex flex-col relative ${
                    plan.is_popular
                      ? "border-primary shadow-xl shadow-primary/10 scale-[1.02]"
                      : "border-border hover:shadow-xl hover:border-primary/50 hover:-translate-y-2"
                  }`}
                  style={{ willChange: "transform", transform: "translateZ(0)" }}
                >
                  {plan.is_popular && (
                    <div className="bg-primary text-primary-foreground text-center py-2.5 text-sm font-bold">
                      ⭐ Most Popular
                    </div>
                  )}

                  <div className={`p-8 flex-shrink-0 relative z-10 ${plan.is_popular ? "" : "pt-12"}`}>
                    <div className="space-y-4">
                      <h3 className={`text-2xl font-bold ${plan.is_popular ? "text-primary" : ""}`}>{plan.name}</h3>

                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground font-medium">/ {plan.duration}</span>
                      </div>

                      {plan.original_price && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground line-through">{plan.original_price}</span>
                          <span className="bg-primary/10 text-primary border border-primary/30 font-bold px-2 py-1 rounded text-xs">
                            {plan.discount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-8 pt-0 flex flex-col flex-1 relative z-10">
                    <ul className="space-y-3 flex-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-primary text-xs">✓</span>
                          </div>
                          <span className="text-sm leading-relaxed text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-6 flex-shrink-0">
                      <button
                        onClick={() => handleSelectPlan(plan.id)}
                        className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 text-primary-foreground shadow-md hover:shadow-lg hover:scale-[1.02] cursor-pointer ${
                          plan.is_popular ? "bg-primary hover:bg-primary/90" : "bg-primary hover:bg-primary/90"
                        }`}
                      >
                        Get Started
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && selectedPlan && (
        <EnhancedPurchaseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          planPrice={selectedPlan.price}
          planDuration={selectedPlan.duration}
        />
      )}
    </section>
  )
}

export default PricingSection
