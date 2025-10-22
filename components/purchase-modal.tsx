"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MessageCircle, 
  ExternalLink,
  Crown,
  Sparkles
} from "lucide-react"

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  planName: string
  planPrice: string
  planDuration: string
}

export default function PurchaseModal({
  isOpen,
  onClose,
  planName,
  planPrice,
  planDuration,
}: PurchaseModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleTelegramContact = () => {
    setIsLoading(true)
    
    // Create predefined message with package data
    const message = `Hello! I want to purchase the ${planName} premium package.

📦 Package Details:
• Plan: ${planName}
• Price: ${planPrice}
• Duration: ${planDuration}

Please provide me with the payment details and process.

Thank you!`
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message)
    
    // Open Telegram bot with predefined message
    window.open(`https://t.me/ugenpro_admin?text=${encodedMessage}`, "_blank")
    
    setTimeout(() => {
      setIsLoading(false)
      onClose()
    }, 1000)
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Crown className="h-6 w-6 text-yellow-500" />
            Purchase Premium Package
          </DialogTitle>
          <DialogDescription className="text-base">
            Contact the admin to purchase this premium package.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Details - Screenshot Style */}
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-xl">{planName}</h3>
                  <p className="text-sm text-muted-foreground">{planDuration}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{planPrice}</div>
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs">📦</span>
                  </div>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    This package information will be automatically sent to the admin
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Admin Section */}
          <div className="space-y-4">
            <h4 className="font-bold text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Contact Admin
            </h4>
            
            <Button
              onClick={handleTelegramContact}
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              {isLoading ? "Opening Telegram..." : "Contact Admin"}
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Note Section */}
          <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600">
            <CardContent className="p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Note:</strong> After contacting the admin, you will receive payment instructions and your premium access will be activated within 24 hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
