"use client"

import { Zap, Users, BarChart3, Shield, Workflow, Clock } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built for speed. Experience instant updates and real-time collaboration without lag.",
    color: "from-primary/20 to-primary/5",
    borderColor: "border-primary/30",
    iconBg: "from-primary/30 to-primary/10",
    textColor: "text-primary",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work together seamlessly with built-in chat, comments, and file sharing.",
    color: "from-accent/20 to-accent/5",
    borderColor: "border-accent/30",
    iconBg: "from-accent/30 to-accent/10",
    textColor: "text-accent",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Get insights into team performance with detailed reports and visualizations.",
    color: "from-tertiary/20 to-tertiary/5",
    borderColor: "border-tertiary/30",
    iconBg: "from-tertiary/30 to-tertiary/10",
    textColor: "text-tertiary",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption and compliance with SOC 2, GDPR, and HIPAA standards.",
    color: "from-quaternary/20 to-quaternary/5",
    borderColor: "border-quaternary/30",
    iconBg: "from-quaternary/30 to-quaternary/10",
    textColor: "text-quaternary",
  },
  {
    icon: Workflow,
    title: "Custom Workflows",
    description: "Create automated workflows that match your team's unique processes.",
    color: "from-primary/20 to-accent/5",
    borderColor: "border-primary/30",
    iconBg: "from-primary/30 to-accent/20",
    textColor: "text-primary",
  },
  {
    icon: Clock,
    title: "Time Tracking",
    description: "Track time spent on tasks and projects with integrated time tracking tools.",
    color: "from-accent/20 to-tertiary/5",
    borderColor: "border-accent/30",
    iconBg: "from-accent/30 to-tertiary/20",
    textColor: "text-accent",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-8 md:py-20 overflow-hidden">
      <div className="absolute inset-0 -z-10 sm:hidden bg-gradient-to-b from-background to-background/95" />

      <div className="absolute inset-0 -z-10 hidden sm:block">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/2 to-background" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full glass shadow-glow px-6 py-3 backdrop-blur-xl">
            <Zap className="h-4 w-4 text-primary" />
            <span className="gradient-text font-bold text-sm">Powerful Features</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-balance">
            <span className="text-shadow-lg">Everything you need to</span>{" "}
            <span className="gradient-text-rainbow text-shadow-lg">manage projects</span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto text-balance font-medium">
            Powerful features designed to help your team work smarter, not harder, with
            <span className="text-primary font-semibold"> cutting-edge technology</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group rounded-3xl p-4 sm:p-8 bg-gradient-to-br ${feature.color} backdrop-blur-xl hover:backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-primary/15`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.iconBg} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-3xl`}
              />

              <div className="relative z-10">
                <div
                  className={`mb-5 inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.iconBg} shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300`}
                >
                  <feature.icon className={`h-7 w-7 ${feature.textColor}`} />
                </div>

                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-foreground group-hover:text-foreground transition-colors">
                  {feature.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-muted-foreground/90 transition-colors">
                  {feature.description}
                </p>

                <div
                  className={`mt-4 w-12 h-1.5 bg-gradient-to-r ${feature.iconBg} rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-glow`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
