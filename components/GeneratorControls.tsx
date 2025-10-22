"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Zap, Loader2, Instagram, Facebook, Smartphone } from "lucide-react"

interface GeneratorControlsProps {
  platform: string
  setPlatform: (value: string) => void
  appType: string
  setAppType: (value: string) => void
  quantity: number
  setQuantity: (value: number) => void
  isGenerating: boolean
  onGenerate: () => void
}

export default function GeneratorControls({
  platform,
  setPlatform,
  appType,
  setAppType,
  quantity,
  setQuantity,
  isGenerating,
  onGenerate,
}: GeneratorControlsProps) {
  return (
    <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 shadow-2xl rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-white/50 to-transparent dark:from-slate-700/50 dark:to-transparent backdrop-blur-sm">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100">
          <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-lg backdrop-blur-sm">
            <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          </div>
          Generation settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="platform" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Platform
            </Label>
            <Select value={platform} onValueChange={setPlatform} disabled={isGenerating}>
              <SelectTrigger
                id="platform"
                className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm border border-white/40 dark:border-slate-600/40 shadow-lg"
                aria-label="Select platform"
              >
                <SelectValue placeholder="Select Platform" />
              </SelectTrigger>
              <SelectContent className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 shadow-2xl">
                <SelectItem value="ios">
                  <div className="flex items-center gap-2">
                    <span className="text-lg" aria-hidden="true">
                      📱
                    </span>
                    iOS
                  </div>
                </SelectItem>
                <SelectItem value="android">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" aria-hidden="true" />
                    Samsung
                  </div>
                </SelectItem>
                <SelectItem value="pixel">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" aria-hidden="true" />
                    <div className="flex flex-col">
                      <span>Mix</span>
                      <span className="text-xs text-muted-foreground">Pixel, Motorola</span>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appType" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              App Type
            </Label>
            <Select value={appType} onValueChange={setAppType} disabled={isGenerating || !platform}>
              <SelectTrigger
                id="appType"
                className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm border border-white/40 dark:border-slate-600/40 shadow-lg"
                aria-label="Select app type"
              >
                <SelectValue placeholder={!platform ? "Select Platform First" : "Select App"} />
              </SelectTrigger>
              <SelectContent className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 shadow-2xl">
                {platform === "android" && (
                  <>
                    <SelectItem value="instagram">
                      <div className="flex items-center gap-2">
                        <Instagram className="w-4 h-4" aria-hidden="true" />
                        Instagram
                      </div>
                    </SelectItem>
                    <SelectItem value="facebook">
                      <div className="flex items-center gap-2">
                        <Facebook className="w-4 h-4" aria-hidden="true" />
                        Facebook
                      </div>
                    </SelectItem>
                    <SelectItem value="chrome">
                      <div className="flex items-center gap-2">
                        <span className="text-lg" aria-hidden="true">
                          🌐
                        </span>
                        Chrome
                      </div>
                    </SelectItem>
                  </>
                )}
                {platform === "pixel" && (
                  <>
                    <SelectItem value="instagram">
                      <div className="flex items-center gap-2">
                        <Instagram className="w-4 h-4" aria-hidden="true" />
                        Instagram
                      </div>
                    </SelectItem>
                    <SelectItem value="facebook">
                      <div className="flex items-center gap-2">
                        <Facebook className="w-4 h-4" aria-hidden="true" />
                        Facebook
                      </div>
                    </SelectItem>
                    <SelectItem value="chrome">
                      <div className="flex items-center gap-2">
                        <span className="text-lg" aria-hidden="true">
                          🌐
                        </span>
                        Chrome
                      </div>
                    </SelectItem>
                  </>
                )}
                {platform === "ios" && (
                  <>
                    <SelectItem value="instagram">
                      <div className="flex items-center gap-2">
                        <Instagram className="w-4 h-4" aria-hidden="true" />
                        Instagram
                      </div>
                    </SelectItem>
                    <SelectItem value="facebook">
                      <div className="flex items-center gap-2">
                        <Facebook className="w-4 h-4" aria-hidden="true" />
                        Facebook
                      </div>
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              max="1000"
              value={quantity === 0 ? "" : quantity}
              onChange={(e) => {
                const value = e.target.value
                if (value === "") {
                  setQuantity(0)
                } else {
                  const numValue = Number.parseInt(value) || 0
                  setQuantity(Math.max(0, Math.min(numValue, 1000)))
                }
              }}
              onInput={(e) => {
                const input = e.target as HTMLInputElement
                const numValue = Number.parseInt(input.value) || 0
                if (numValue > 1000) {
                  input.value = "1000"
                  setQuantity(1000)
                }
              }}
              onBlur={(e) => {
                const numValue = Number.parseInt(e.target.value) || 0
                if (numValue > 1000) {
                  setQuantity(1000)
                } else if (numValue < 0) {
                  setQuantity(0)
                }
              }}
              className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm border border-white/40 dark:border-slate-600/40 shadow-lg"
              placeholder="Enter quantity (0-1,000)"
              disabled={isGenerating}
              aria-describedby="quantity-help"
            />
            <p id="quantity-help" className="sr-only">
              Enter quantity between 0 and 1,000
            </p>
          </div>
        </div>

        <Button
          onClick={onGenerate}
          disabled={isGenerating || !platform || !appType || quantity < 1}
          className="w-full bg-[#1D6DFF] hover:bg-[#1557D9] text-white h-12 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-describedby="generate-help"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              <span>Generating...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" aria-hidden="true" />
              <span>Generate</span>
            </div>
          )}
        </Button>
        <p id="generate-help" className="sr-only">
          Generate unique user agents for the selected platform and app
        </p>
      </CardContent>
    </Card>
  )
}
