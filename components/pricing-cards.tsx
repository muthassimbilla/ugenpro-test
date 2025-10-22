"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { pricingPlans } from "@/lib/pricing-data"
import { memo, useState } from "react"
import EnhancedPurchaseModal from "@/components/enhanced-purchase-modal"

interface PricingCardsProps {
  onSelectPlan?: (planId: string) => void
  buttonText?: string
  showContactAdmin?: boolean
}

const PricingCard = memo(
  ({
    plan,
    onButtonClick,
    buttonText,
  }: {
    plan: (typeof pricingPlans)[0]
    onButtonClick: (planId: string) => void
    buttonText: string
  }) => {
    return (
      <div className="group h-full">
        <Card
          className={`h-full hover-lift rounded-3xl bg-gradient-to-br from-white/95 via-blue-50/90 to-white/95 dark:from-gray-900/95 dark:via-blue-950/90 dark:to-gray-900/95 shadow-xl transition-all duration-500 overflow-hidden flex flex-col relative ${
            plan.is_popular
              ? "ring-2 ring-primary shadow-2xl shadow-primary/30 border border-primary/50 scale-105"
              : "border border-[#2B7FFF]/20 dark:border-[#2B7FFF]/30 hover:border-[#2B7FFF]/40 hover:shadow-2xl hover:shadow-[#2B7FFF]/25 hover:-translate-y-3"
          }`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${
              plan.is_popular
                ? "from-primary/10 via-accent/5 to-transparent"
                : "from-primary/5 via-transparent to-accent/5"
            } opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
          />

          {plan.is_popular && (
            <div className="bg-gradient-to-r from-[#2B7FFF] via-[#4a9fff] to-[#2B7FFF] text-white text-center py-2.5 text-sm font-bold shadow-lg">
              ⭐ Most Popular
            </div>
          )}

          <CardHeader className={`p-8 flex-shrink-0 relative z-10 ${plan.is_popular ? "" : "pt-12"}`}>
            <div className="space-y-4">
              <h3
                className={`text-2xl font-bold ${plan.is_popular ? "bg-gradient-to-r from-[#2B7FFF] via-[#4a9fff] to-[#2B7FFF] bg-clip-text text-transparent" : ""}`}
              >
                {plan.name}
              </h3>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  {plan.price}
                </span>
                <span className="text-muted-foreground font-medium">/ {plan.duration}</span>
              </div>

              {plan.original_price && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground line-through">{plan.original_price}</span>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30 font-bold shadow-sm"
                  >
                    {plan.discount}
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-8 pt-0 flex flex-col flex-1 relative z-10">
            <ul className="space-y-3 flex-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 group/item">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-300">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm leading-relaxed text-muted-foreground group-hover/item:text-foreground transition-colors">
                    {feature
                      .split(" ")
                      .map((word, wordIdx) =>
                        word.toLowerCase() === "unlimited" ? (
                          <span
                            key={wordIdx}
                            className="font-bold text-primary bg-gradient-to-r from-primary/20 to-accent/20 px-1.5 py-0.5 rounded"
                          >
                            {word}
                          </span>
                        ) : (
                          <span key={wordIdx}>{word}</span>
                        ),
                      )
                      .reduce((prev, curr, idx) => [prev, idx > 0 ? " " : "", curr])}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-6 flex-shrink-0">
              <button
                onClick={() => {
                  if (typeof window !== "undefined" && (window as any).gtag) {
                    ;(window as any).gtag("event", "buy_now_click", {
                      event_category: "pricing",
                      event_label: plan.id,
                      value: plan.price,
                    })
                  }
                  console.log(`Buy Now clicked for plan: ${plan.id}`)
                  onButtonClick(plan.id)
                }}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 text-white shadow-lg hover:shadow-2xl hover:scale-105 cursor-pointer border relative overflow-hidden group/btn ${
                  plan.is_popular
                    ? "bg-gradient-to-r from-[#2B7FFF] via-[#4a9fff] to-[#2B7FFF] border-[#2B7FFF]/50"
                    : "bg-[#2B7FFF] border-[#2B7FFF]/50"
                }`}
              >
                <span className="relative z-10">{buttonText}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  },
)

PricingCard.displayName = "PricingCard"

export function PricingCards({
  onSelectPlan,
  buttonText = "Get Started",
  showContactAdmin = false,
}: PricingCardsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string
    name: string
    price: string
    duration: string
  } | null>(null)

  const handleContactAdmin = () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", "contact_admin", {
        event_category: "pricing",
        event_label: "email_click",
      })
    }
    window.location.href = "mailto:admin@example.com?subject=Premium Tools Access&body=আমি Premium Tools এক্সেস করতে চাই।"
  }

  const handleButtonClick = (planId: string) => {
    console.log("Button clicked:", planId, "showContactAdmin:", showContactAdmin)
    if (showContactAdmin) {
      // Find the selected plan
      const plan = pricingPlans.find((p) => p.id === planId)
      console.log("Found plan:", plan)
      if (plan) {
        setSelectedPlan({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          duration: plan.duration,
        })
        setIsModalOpen(true)
        console.log("Modal should open now")
      }
    } else if (onSelectPlan) {
      onSelectPlan(planId)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPlan(null)
  }

  console.log("Rendering PricingCards - isModalOpen:", isModalOpen, "selectedPlan:", selectedPlan)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto px-4 sm:px-0">
        {pricingPlans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} onButtonClick={handleButtonClick} buttonText={buttonText} />
        ))}
      </div>

      {/* Enhanced Purchase Modal */}
      {selectedPlan && (
        <EnhancedPurchaseModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          planPrice={selectedPlan.price}
          planDuration={selectedPlan.duration}
        />
      )}
    </>
  )
}
