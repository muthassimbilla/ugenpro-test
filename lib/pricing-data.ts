export interface PricingPlan {
  id: string
  name: string
  price: string
  duration: string
  original_price?: string
  discount?: string
  savings?: string
  description?: string
  features: string[]
  is_popular: boolean
  icon?: string
  gradient: string
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "1-month",
    name: "1 Month",
    price: "৳1,000",
    duration: "for 1 month",
    description: "Perfect for getting started",
    features: [
      "User Agent Generator (Unlimited)",
      "Address Generator (Unlimited)",
      "Email → Name Generator (Unlimited)",
      "24/7 Support",
    ],
    is_popular: false,
    icon: "Zap",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    id: "3-months",
    name: "3 Months",
    price: "৳2,400",
    duration: "for 3 months",
    original_price: "৳3,000",
    discount: "20% Save",
    savings: "Save ৳600",
    description: "Most Popular Plan",
    features: [
      "User Agent Generator (Unlimited)",
      "Address Generator (Unlimited)",
      "Email → Name Generator (Unlimited)",
      "24/7 Support",
    ],
    is_popular: true,
    icon: "Crown",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    id: "6-months",
    name: "6 Months",
    price: "৳4,020",
    duration: "for 6 months",
    original_price: "৳6,000",
    discount: "33% Save",
    savings: "Save ৳1,980",
    description: "Maximum Value Savings",
    features: [
      "User Agent Generator (Unlimited)",
      "Address Generator (Unlimited)",
      "Email → Name Generator (Unlimited)",
      "24/7 Support",
    ],
    is_popular: false,
    icon: "Sparkles",
    gradient: "from-orange-500 to-red-600",
  },
]
