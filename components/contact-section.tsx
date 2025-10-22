"use client"

import { MessageCircle, User, ExternalLink } from "lucide-react"

export function ContactSection() {
  const contactInfo = [
    {
      icon: MessageCircle,
      title: "Telegram Channel",
      value: "Join our community",
      description: "Join our community for updates and discussions",
      actionText: "Join Channel",
      actionLink: "https://t.me/+DS9l9qeSDfgxODI9",
      actionIcon: ExternalLink,
    },
    {
      icon: User,
      title: "Admin Account",
      value: "Contact our admin",
      description: "Direct contact with our admin team",
      actionText: "Contact Admin",
      actionLink: "https://t.me/ugenpro_admin",
      actionIcon: ExternalLink,
    },
  ]

  return (
    <section id="contact" className="relative py-12 overflow-hidden bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass shadow-sm border border-primary/20 text-sm font-bold mb-4 transition-all duration-300 hover:scale-105">
            <MessageCircle className="w-4 h-4 text-primary" />
            <span className="text-primary font-bold">Contact Us</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
            <span className="text-shadow-lg">Get in </span>
            <span className="text-primary text-shadow-lg">Touch</span>
          </h2>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We're here to help you succeed. Reach out to our team through any of the channels below.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 max-w-5xl mx-auto px-4 sm:px-0">
          {contactInfo.map((contact, index) => {
            const IconComponent = contact.icon
            return (
              <div key={index} className="group relative w-full sm:w-80 lg:w-96 xl:w-[28rem]">
                <div
                  className="group relative overflow-hidden cursor-pointer transition-all duration-500 rounded-2xl bg-card border border-border hover:border-primary/50 shadow-lg hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-3 h-full"
                  style={{ willChange: "transform", transform: "translateZ(0)" }}
                >
                  <div className="p-6 sm:p-8 space-y-4 sm:space-y-6 h-full flex flex-col relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 group-hover:scale-110 transition-all duration-300">
                        <IconComponent className="h-7 w-7 text-primary" />
                      </div>
                    </div>

                    <div className="space-y-4 flex-1">
                      <h3 className="text-2xl font-bold text-primary">{contact.title}</h3>

                      <p className="text-base text-muted-foreground leading-relaxed font-medium">
                        {contact.description}
                      </p>

                      <div className="space-y-2">
                        <span className="inline-block font-semibold text-sm px-4 py-2 rounded-xl glass border border-primary/20 text-primary">
                          {contact.value}
                        </span>
                      </div>
                    </div>

                    <a
                      href={contact.actionLink}
                      target={contact.actionLink.startsWith("http") ? "_blank" : "_self"}
                      rel={contact.actionLink.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="group/btn relative w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <contact.actionIcon className="w-5 h-5" />
                        <span className="text-base">{contact.actionText}</span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
