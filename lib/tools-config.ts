import { MapPin, Mail, Monitor } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface Tool {
  id: string
  name: string
  description: string
  icon: LucideIcon
  features: string[]
  demoImage?: string
  demoVideo?: string
  ctaText: string
  ctaLink: string
  color: string
}

export const toolsData: Tool[] = [
  {
    id: "user-agent-generator",
    name: "User Agent Generator",
    description:
      "Generate realistic user agent strings for CPA campaigns and browser testing. Perfect for CPA self signup and marketing automation.",
    icon: Monitor,
    features: [
      "Generate Facebook and Instagram User Agents for iPhone, Samsung, Pixel, and more devices.",
      "Generate bulk user agents in one click",
      "Generate unlimited real user agents",
      "CPA campaign optimization",
      "Always updated user agents",
      "One click copy and download facility.",
    ],
    demoVideo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/User_Agent_Generator_demo-injMwl5mAZbnPiudauCVCu1gdBgKR1.mp4",
    ctaText: "Use User Agent Generator",
    ctaLink: "/tool/user-agent-generator",
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  },
  {
    id: "address-generator",
    name: "Address Generator",
    description:
      "Generate realistic US addresses for CPA campaigns and lead generation. Essential tool for CPA self signup and marketing automation.",
    icon: MapPin,
    features: [
      "Generate addresses from IP addresses",
      "Generate addresses from ZIP codes",
      "CPA campaign address generation",
      "Copy individual fields or full address (fast copy)",
      "Easy to use.",
    ],
    demoVideo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Address_Generator_demo-qWPHWzeu12w6Dz5Bs1VwoslkY5uajF.mp4",
    ctaText: "Use Address Generator",
    ctaLink: "/tool/address-generator",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  },
  {
    id: "email2name",
    name: "Email to Name",
    description:
      "Transform email addresses into realistic names for CPA campaigns and lead generation. AI-powered tool for CPA self signup.",
    icon: Mail,
    features: [
      "Generate full name, first & last name with gender.",
      "CPA campaign name generation.",
      "Auto-generate on paste feature",
      "Auto-generate on paste feature (fast work).",
    ],
    demoVideo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/email2name_demo-fhtmFqRM7Cbzxy7mGVXiNvAkju8Aqw.mp4",
    ctaText: "Use Email2Name",
    ctaLink: "/tool/email2name",
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
  },
]
