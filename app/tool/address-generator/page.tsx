"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, MapPin, Navigation, RotateCcw, Copy, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { ApiUsageCounter } from "@/components/api-usage-counter"
import { useApiClient } from "@/lib/api-client"

interface AddressData {
  addresses: string[]
  currentIndex: number
  totalCount: number
}

export default function AddressGeneratorPage() {
  const [ipAddress, setIpAddress] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [addressData, setAddressData] = useState<AddressData>({
    addresses: [],
    currentIndex: 0,
    totalCount: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("ip")
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const usageCounterRef = useRef<{ updateAfterApiCall: (result: any) => void; refreshUsage: () => void }>(null)
  const { apiCall } = useApiClient()

  // Paste from clipboard function
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (activeTab === "ip") {
        setIpAddress(text.trim())
      } else {
        setZipCode(text.trim())
      }
      toast.success("Pasted from clipboard")
    } catch (err) {
      toast.error("Cannot access clipboard")
    }
  }

  // Generate addresses from IP
  const generateFromIP = async () => {
    if (!ipAddress.trim()) {
      toast.error("Please enter an IP address")
      return
    }

    setIsLoading(true)
    try {
      const response = await apiCall("/api/address-generator/ip", {
        method: "POST",
        body: { ip: ipAddress.trim() },
      })

      const data = await response.json()

      if (data.success) {
        setAddressData({
          addresses: data.addresses,
          currentIndex: 0,
          totalCount: data.addresses.length,
        })
        toast.success(`Found ${data.addresses.length} addresses`)

        // Update usage counter
        if (data.rate_limit && usageCounterRef.current) {
          console.log("Calling updateAfterApiCall with:", data.rate_limit)
          usageCounterRef.current.updateAfterApiCall(data.rate_limit)
          // Also refresh to ensure we have latest data
          setTimeout(() => {
            if (usageCounterRef.current) {
              usageCounterRef.current.refreshUsage()
            }
          }, 500)
        }
      } else {
        setAddressData({ addresses: [], currentIndex: 0, totalCount: 0 })

        if (data.auth_required) {
          toast.error("লগিন করুন প্রথমে। এই টুল ব্যবহার করতে লগিন প্রয়োজন।")
        } else if (data.rate_limit && data.error && data.error.includes("লিমিট")) {
          toast.error(data.error)
          if (usageCounterRef.current) {
            console.log("Calling updateAfterApiCall with rate limit error:", data.rate_limit)
            usageCounterRef.current.updateAfterApiCall(data.rate_limit)
          }
        } else {
          toast.error(data.error || "IP ঠিকানা রেজলভ করতে পারছি না")
        }
      }
    } catch (error) {
      toast.error("API call failed")
      setAddressData({ addresses: [], currentIndex: 0, totalCount: 0 })
    } finally {
      setIsLoading(false)
    }
  }

  // Generate addresses from ZIP
  const generateFromZIP = async () => {
    if (!zipCode.trim()) {
      toast.error("Please enter a ZIP code")
      return
    }

    if (!/^\d+$/.test(zipCode.trim())) {
      toast.error("ZIP code must be numeric only")
      return
    }

    setIsLoading(true)
    try {
      const response = await apiCall("/api/address-generator/zip", {
        method: "POST",
        body: { zip: zipCode.trim() },
      })

      const data = await response.json()

      if (data.success) {
        setAddressData({
          addresses: data.addresses,
          currentIndex: 0,
          totalCount: data.addresses.length,
        })
        toast.success(`Found ${data.addresses.length} addresses`)

        // Update usage counter
        if (data.rate_limit && usageCounterRef.current) {
          console.log("Calling updateAfterApiCall with:", data.rate_limit)
          usageCounterRef.current.updateAfterApiCall(data.rate_limit)
          // Also refresh to ensure we have latest data
          setTimeout(() => {
            if (usageCounterRef.current) {
              usageCounterRef.current.refreshUsage()
            }
          }, 500)
        }
      } else {
        setAddressData({ addresses: [], currentIndex: 0, totalCount: 0 })

        if (data.auth_required) {
          toast.error("লগিন করুন প্রথমে। এই টুল ব্যবহার করতে লগিন প্রয়োজন।")
        } else if (data.rate_limit && data.error && data.error.includes("লিমিট")) {
          toast.error(data.error)
          if (usageCounterRef.current) {
            console.log("Calling updateAfterApiCall with rate limit error:", data.rate_limit)
            usageCounterRef.current.updateAfterApiCall(data.rate_limit)
          }
        } else {
          toast.error(data.error || "ZIP কোড রেজলভ করতে পারছি না")
        }
      }
    } catch (error) {
      toast.error("API call failed")
      setAddressData({ addresses: [], currentIndex: 0, totalCount: 0 })
    } finally {
      setIsLoading(false)
    }
  }

  // Navigation functions
  const showNext = () => {
    if (addressData.currentIndex < addressData.addresses.length - 1) {
      setAddressData((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
      }))
    }
  }

  const showPrevious = () => {
    if (addressData.currentIndex > 0) {
      setAddressData((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex - 1,
      }))
    }
  }

  // Copy address to clipboard
  const copyAddress = async (address: string, index: number) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedIndex(index)
      // Remove toast notification - just show tick mark
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      // Only show error toast for actual failures
      toast.error("Failed to copy")
    }
  }

  // Copy specific address part
  const copyAddressPart = async (part: string, partName: string) => {
    try {
      await navigator.clipboard.writeText(part)
      setCopiedField(partName)
      // Remove toast notification - just show tick mark
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      // Only show error toast for actual failures
      toast.error("Failed to copy")
    }
  }

  // Reset function
  const reset = () => {
    setIpAddress("")
    setZipCode("")
    setAddressData({ addresses: [], currentIndex: 0, totalCount: 0 })
    toast.info("Reset successfully")
  }

  const parseAddress = (address: string) => {
    const parts = address.split(", ")

    if (parts.length >= 4) {
      // Full address format: "123 Main St, New York, NY 10001, United States"
      const street = parts[0]
      const city = parts[1]
      const stateZip = parts[2]
      const country = parts[3]

      // Extract state and ZIP from "NY 10001" format
      const stateZipMatch = stateZip.match(/^([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/)
      if (stateZipMatch) {
        return {
          street,
          city,
          state: stateZipMatch[1],
          zip: stateZipMatch[2],
          country,
          fullAddress: address,
        }
      }

      // Try full state name format: "Ohio 43402"
      const fullStateMatch = stateZip.match(/^([A-Za-z\s]+?)\s+(\d{5}(?:-\d{4})?)$/)
      if (fullStateMatch) {
        return {
          street,
          city,
          state: fullStateMatch[1].trim(),
          zip: fullStateMatch[2],
          country,
          fullAddress: address,
        }
      }

      return {
        street,
        city,
        state: stateZip,
        zip: "",
        country,
        fullAddress: address,
      }
    } else if (parts.length >= 3) {
      // Format: "924 Ridge Street, Bowling Green, Ohio 43402"
      const street = parts[0]
      const city = parts[1]
      const lastPart = parts[2]

      // Try to extract state and ZIP from the last part
      // Pattern 1: "Ohio 43402" or "NY 10001" (state name/code + ZIP)
      const stateZipMatch = lastPart.match(/^([A-Za-z\s]+?)\s+(\d{5}(?:-\d{4})?)$/)
      if (stateZipMatch) {
        return {
          street,
          city,
          state: stateZipMatch[1].trim(),
          zip: stateZipMatch[2],
          country: "United States",
          fullAddress: address,
        }
      }

      // Pattern 2: Just a ZIP code
      if (/^\d{5}(?:-\d{4})?$/.test(lastPart)) {
        return {
          street,
          city,
          state: "",
          zip: lastPart,
          country: "United States",
          fullAddress: address,
        }
      }

      // Pattern 3: Just a state name
      return {
        street,
        city,
        state: lastPart,
        zip: "",
        country: "United States",
        fullAddress: address,
      }
    } else if (parts.length === 2) {
      // Format: "123 Main St, New York" or "New York, NY 10001"
      const first = parts[0]
      const second = parts[1]

      // Check if second part is state+zip
      const stateZipMatch = second.match(/^([A-Za-z\s]+?)\s+(\d{5}(?:-\d{4})?)$/)
      if (stateZipMatch) {
        return {
          street: first,
          city: "",
          state: stateZipMatch[1].trim(),
          zip: stateZipMatch[2],
          country: "United States",
          fullAddress: address,
        }
      }

      return {
        street: first,
        city: second,
        state: "",
        zip: "",
        country: "United States",
        fullAddress: address,
      }
    }

    return {
      street: address,
      city: "",
      state: "",
      zip: "",
      country: "",
      fullAddress: address,
    }
  }

  const currentAddress =
    addressData.addresses.length > 0 ? parseAddress(addressData.addresses[addressData.currentIndex]) : null

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Side - Input Section */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="ip" className="text-sm">
                  IP → Address
                </TabsTrigger>
                <TabsTrigger value="zip" className="text-sm">
                  ZIP → Address
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ip" className="space-y-0">
                <Card className="h-[500px] flex flex-col">
                  <CardHeader className="pb-4 flex-shrink-0">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      Generate from IP Address
                    </CardTitle>
                    <CardDescription>Enter an IP address and get real addresses from that area</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 flex-1">
                    <div className="space-y-3">
                      <Label htmlFor="ip-input" className="text-sm font-medium">
                        IP Address
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="ip-input"
                          placeholder="e.g., 8.8.8.8"
                          value={ipAddress}
                          onChange={(e) => setIpAddress(e.target.value)}
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm" onClick={pasteFromClipboard}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={generateFromIP}
                        disabled={isLoading || !ipAddress.trim()}
                        className="w-full"
                        size="lg"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <MapPin className="h-4 w-4 mr-2" />
                        )}
                        Generate from IP
                      </Button>
                      <Button variant="outline" onClick={reset} className="w-full bg-transparent">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>

                    {/* API Usage Counter - Inside card at bottom */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <ApiUsageCounter
                        ref={usageCounterRef}
                        apiType="address_generator"
                        compact={true}
                        showProgressBar={false}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="zip" className="space-y-0">
                <Card className="h-[500px] flex flex-col">
                  <CardHeader className="pb-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-6 w-6 text-green-500" />
                          Generate from ZIP Code
                        </CardTitle>
                        <CardDescription>Enter a ZIP code and get random addresses from that area</CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-sm">
                        {activeTab === "ip" ? "From IP" : "From ZIP"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 flex-1">
                    <div className="space-y-3">
                      <Label htmlFor="zip-input" className="text-sm font-medium">
                        ZIP Code
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="zip-input"
                          placeholder="e.g., 10001"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm" onClick={pasteFromClipboard}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={generateFromZIP}
                        disabled={isLoading || !zipCode.trim()}
                        className="w-full"
                        size="lg"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <MapPin className="h-4 w-4 mr-2" />
                        )}
                        Generate from ZIP
                      </Button>
                      <Button variant="outline" onClick={reset} className="w-full bg-transparent">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>

                    {/* API Usage Counter - Inside card at bottom */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <ApiUsageCounter
                        ref={usageCounterRef}
                        apiType="address_generator"
                        compact={true}
                        showProgressBar={false}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Side - Output Section */}
          <div className="space-y-6">
            {addressData.addresses.length > 0 && currentAddress ? (
              <Card className="h-[650px] flex flex-col">
                <CardHeader className="pb-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Navigation className="h-6 w-6 text-purple-500" />
                        Found: {addressData.totalCount} addresses
                      </CardTitle>
                      <CardDescription>
                        Address {addressData.currentIndex + 1} / {addressData.totalCount}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {activeTab === "ip" ? "From IP" : "From ZIP"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 flex-1 overflow-y-auto">
                  {/* Address Parts - Grid Layout */}
                  <div className="space-y-6">
                    {/* Full Address - Full Width */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-muted-foreground">Full Address</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyAddressPart(currentAddress.fullAddress, "Full Address")}
                          className={`h-8 w-8 p-0 transition-all duration-300 ${
                            copiedField === "Full Address"
                              ? "bg-green-100 dark:bg-green-800/30 scale-110"
                              : "hover:bg-orange-100 dark:hover:bg-orange-800/30"
                          }`}
                        >
                          {copiedField === "Full Address" ? (
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          )}
                        </Button>
                      </div>
                      <Alert
                        className={`border-2 transition-all duration-300 ${
                          copiedField === "Full Address"
                            ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-300 dark:ring-green-700"
                            : "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100/50 dark:hover:bg-orange-900/30"
                        }`}
                      >
                        <MapPin className="h-5 w-5 text-orange-600" />
                        <AlertDescription className="text-sm font-medium text-orange-900 dark:text-orange-100 text-center">
                          {currentAddress.fullAddress}
                        </AlertDescription>
                      </Alert>
                    </div>

                    {/* Address Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Street Address */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium text-muted-foreground">Street Address</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyAddressPart(currentAddress.street, "Street Address")}
                            className={`h-6 w-6 p-0 transition-all duration-300 ${
                              copiedField === "Street Address"
                                ? "bg-green-100 dark:bg-green-800/30 scale-110"
                                : "hover:bg-blue-100 dark:hover:bg-blue-800/30"
                            }`}
                          >
                            {copiedField === "Street Address" ? (
                              <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            )}
                          </Button>
                        </div>
                        <div
                          className={`p-3 rounded-lg border transition-all duration-300 ${
                            copiedField === "Street Address"
                              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 ring-2 ring-green-300 dark:ring-green-700"
                              : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100/50 dark:hover:bg-blue-900/30"
                          }`}
                        >
                          <p className="text-blue-900 dark:text-blue-100 font-medium text-center text-sm">
                            {currentAddress.street}
                          </p>
                        </div>
                      </div>

                      {/* City */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium text-muted-foreground">City</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyAddressPart(currentAddress.city, "City")}
                            className={`h-6 w-6 p-0 transition-all duration-300 ${
                              copiedField === "City"
                                ? "bg-green-100 dark:bg-green-800/30 scale-110"
                                : "hover:bg-green-100 dark:hover:bg-green-800/30"
                            }`}
                          >
                            {copiedField === "City" ? (
                              <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3 text-green-600 dark:text-green-400" />
                            )}
                          </Button>
                        </div>
                        <div
                          className={`p-3 rounded-lg border transition-all duration-300 ${
                            copiedField === "City"
                              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 ring-2 ring-green-300 dark:ring-green-700"
                              : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100/50 dark:hover:bg-green-900/30"
                          }`}
                        >
                          <p className="text-green-900 dark:text-green-100 font-medium text-center text-sm">
                            {currentAddress.city || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* State */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium text-muted-foreground">State</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyAddressPart(currentAddress.state, "State")}
                            className={`h-6 w-6 p-0 transition-all duration-300 ${
                              copiedField === "State"
                                ? "bg-green-100 dark:bg-green-800/30 scale-110"
                                : "hover:bg-purple-100 dark:hover:bg-purple-800/30"
                            }`}
                          >
                            {copiedField === "State" ? (
                              <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                            )}
                          </Button>
                        </div>
                        <div
                          className={`p-3 rounded-lg border transition-all duration-300 ${
                            copiedField === "State"
                              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 ring-2 ring-green-300 dark:ring-green-700"
                              : "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
                          }`}
                        >
                          <p className="text-purple-900 dark:text-purple-100 font-medium text-center text-sm">
                            {currentAddress.state || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* ZIP Code */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium text-muted-foreground">ZIP Code</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyAddressPart(currentAddress.zip, "ZIP Code")}
                            className={`h-6 w-6 p-0 transition-all duration-300 ${
                              copiedField === "ZIP Code"
                                ? "bg-green-100 dark:bg-green-800/30 scale-110"
                                : "hover:bg-orange-100 dark:hover:bg-orange-800/30"
                            }`}
                          >
                            {copiedField === "ZIP Code" ? (
                              <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                            )}
                          </Button>
                        </div>
                        <div
                          className={`p-3 rounded-lg border transition-all duration-300 ${
                            copiedField === "ZIP Code"
                              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 ring-2 ring-green-300 dark:ring-green-700"
                              : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:bg-orange-100/50 dark:hover:bg-orange-900/30"
                          }`}
                        >
                          <p className="text-orange-900 dark:text-orange-100 font-medium text-center text-sm">
                            {currentAddress.zip || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Country */}
                      <div className="space-y-2 col-span-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium text-muted-foreground">Country</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyAddressPart(currentAddress.country, "Country")}
                            className={`h-6 w-6 p-0 transition-all duration-300 ${
                              copiedField === "Country"
                                ? "bg-green-100 dark:bg-green-800/30 scale-110"
                                : "hover:bg-cyan-100 dark:hover:bg-cyan-800/30"
                            }`}
                          >
                            {copiedField === "Country" ? (
                              <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                            )}
                          </Button>
                        </div>
                        <div
                          className={`p-3 rounded-lg border transition-all duration-300 ${
                            copiedField === "Country"
                              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 ring-2 ring-green-300 dark:ring-green-700"
                              : "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100/50 dark:hover:bg-cyan-900/30"
                          }`}
                        >
                          <p className="text-cyan-900 dark:text-cyan-100 font-medium text-center text-sm">
                            {currentAddress.country || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation - Fixed at bottom */}
                  <div className="flex-shrink-0 pt-4 border-t">
                    <div className="flex gap-2 w-full justify-center">
                      <Button
                        variant="outline"
                        onClick={showPrevious}
                        disabled={addressData.currentIndex === 0}
                        className="flex items-center gap-2 flex-1 sm:flex-none hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors bg-transparent"
                      >
                        <Navigation className="h-4 w-4 rotate-180" />
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={showNext}
                        disabled={addressData.currentIndex === addressData.addresses.length - 1}
                        className="flex items-center gap-2 flex-1 sm:flex-none hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors bg-transparent"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">Next</span>
                        <Navigation className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[650px] flex flex-col">
                <CardContent className="flex flex-col items-center justify-center flex-1 text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-6">
                    <MapPin className="h-12 w-12 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-muted-foreground">Enter input to see addresses</h3>
                  <p className="text-muted-foreground max-w-md">
                    Use the form on the left to enter an IP address or ZIP code and get real addresses
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
