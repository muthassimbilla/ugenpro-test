"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone, MapPin, Mail } from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/protected-route"

const tools = [
  {
    name: "User Agent Generator",
    description: "Generate realistic iOS & Android user agents",
    href: "/tool/user-agent-generator",
    icon: Smartphone,
    status: "Active",
    color: "bg-purple-500",
  },
  {
    name: "Address Generator",
    description: "Generate real addresses from IP addresses",
    href: "/tool/address-generator",
    icon: MapPin,
    status: "Active",
    color: "bg-orange-500",
  },
  {
    name: "Email2Name",
    description: "Generate realistic names from email addresses",
    href: "/tool/email2name",
    icon: Mail,
    status: "Active",
    color: "bg-blue-500",
  },
]

export default function ToolsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Tools</h1>
            <p className="text-muted-foreground">Access your creative tools and start building</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const IconComponent = tool.icon
              const isActive = tool.status === "Active"

              return (
                <Card key={tool.name} className="group hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className={`p-4 rounded-2xl ${tool.color} w-fit mb-4`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>

                    <CardTitle className="text-xl font-bold mb-2">{tool.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {isActive ? (
                      <Link href={tool.href}>
                        <Button className="w-full bg-primary hover:bg-primary/90">Open Tool</Button>
                      </Link>
                    ) : (
                      <Button disabled className="w-full" variant="secondary">
                        Coming Soon
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
