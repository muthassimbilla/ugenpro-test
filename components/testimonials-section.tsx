"use client"

import { Star, TrendingUp, Users, Award } from "lucide-react"

const testimonials = [
  {
    quote:
      "UGen Pro has completely transformed how our team works. The tools are incredibly intuitive and powerful. We've seen a 40% increase in productivity!",
    author: "Sarah Johnson",
    role: "CEO at TechStart",
    rating: 5,
  },
  {
    quote:
      "The best generator tools we've ever used. The AI-powered features are exactly what we needed. Saves us hours every day.",
    author: "Michael Chen",
    role: "Product Manager at InnovateCo",
    rating: 5,
  },
  {
    quote:
      "We tried dozens of tools before finding UGen Pro. It's the perfect balance of simplicity and power. Highly recommended!",
    author: "Emily Rodriguez",
    role: "CTO at DataFlow",
    rating: 5,
  },
]

const stats = [
  { icon: Star, value: "4.9/5", label: "Average Rating" },
  { icon: Users, value: "10,000+", label: "Happy Customers" },
  { icon: TrendingUp, value: "98%", label: "Satisfaction Rate" },
  { icon: Award, value: "50+", label: "Awards Won" },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-16 md:py-20 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/2 to-background" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-4xl mb-12 text-center mx-auto">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass shadow-glow text-sm font-bold mb-6 backdrop-blur-xl">
            <Star className="h-4 w-4 text-primary" />
            <span className="gradient-text">Customer Stories</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-balance">
            <span className="text-shadow-lg">Loved by developers</span>{" "}
            <span className="gradient-text-rainbow text-shadow-lg">worldwide</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-balance font-medium max-w-2xl mx-auto">
            Join thousands of developers who trust UGen Pro to{" "}
            <span className="text-primary font-semibold">boost their productivity</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl glass hover:glass-strong hover:shadow-xl hover:shadow-primary/15 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer relative overflow-hidden shadow-lg"
            >
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

              <div className="relative z-10">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm leading-relaxed mb-6 text-foreground/90 font-medium relative">
                  <span className="text-primary text-2xl absolute -top-1 -left-1 font-serif">"</span>
                  <span className="ml-3">{testimonial.quote}</span>
                  <span className="text-primary text-2xl absolute -bottom-3 -right-1 font-serif">"</span>
                </p>

                {/* Author section */}
                <div className="border-t-2 border-gradient-to-r from-primary/20 to-accent/20 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent"></div>
                    </div>
                    <div>
                      <div className="font-bold text-base text-foreground">{testimonial.author}</div>
                      <div className="text-xs text-muted-foreground font-medium mt-1">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl glass hover:glass-strong transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-primary/15"
            >
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

              <div className="relative z-10">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 mb-4 shadow-glow">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-2 gradient-text-rainbow">{stat.value}</div>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
