'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, Settings, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface GlobalLimit {
  id: number
  api_type: 'address_generator' | 'email2name'
  daily_limit: number
  is_unlimited: boolean
  created_at: string
  updated_at: string
}

export default function GlobalLimitsPage() {
  const [limits, setLimits] = useState<GlobalLimit[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load global limits
  const loadLimits = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Loading global limits...')
      const response = await fetch('/api/admin/global-limits')
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        throw new Error(`Failed to load global limits: ${response.status} - ${errorData.error || 'Unknown error'}`)
      }
      
      const data = await response.json()
      console.log('API Response:', data)
      
      if (data.success && data.limits) {
        setLimits(data.limits)
      } else {
        // If no limits returned, create default ones
        const defaultLimits = [
          { id: 1, api_type: 'address_generator', daily_limit: 200, is_unlimited: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 2, api_type: 'email2name', daily_limit: 200, is_unlimited: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ]
        setLimits(defaultLimits)
      }
    } catch (err) {
      console.error('Load limits error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      
      // Set default limits on error
      const defaultLimits = [
        { id: 1, api_type: 'address_generator', daily_limit: 200, is_unlimited: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 2, api_type: 'email2name', daily_limit: 200, is_unlimited: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ]
      setLimits(defaultLimits)
    } finally {
      setLoading(false)
    }
  }

  // Save global limits
  const saveLimits = async () => {
    try {
      setSaving(true)
      setError(null)

      for (const limit of limits) {
        const response = await fetch('/api/admin/global-limits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_type: limit.api_type,
            daily_limit: limit.daily_limit,
            is_unlimited: limit.is_unlimited,
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to save ${limit.api_type} limit`)
        }
      }

      toast.success('Global limits updated successfully!')
      await loadLimits() // Reload to get updated data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      toast.error(`Error: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  // Update limit value
  const updateLimit = (apiType: string, field: 'daily_limit' | 'is_unlimited', value: any) => {
    setLimits(prev => prev.map(limit => 
      limit.api_type === apiType 
        ? { ...limit, [field]: value }
        : limit
    ))
  }

  // Get API display name
  const getApiDisplayName = (apiType: string) => {
    switch (apiType) {
      case 'address_generator':
        return 'Address Generator'
      case 'email2name':
        return 'Email to Name'
      default:
        return apiType
    }
  }

  useEffect(() => {
    loadLimits()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading global limits...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="h-8 w-8 text-blue-500" />
              Global API Limits
            </h1>
            <p className="text-muted-foreground mt-2">
              Set global daily limits for all users. These limits apply to all users unless they have individual overrides.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Limits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {limits.map((limit) => (
            <Card key={limit.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{getApiDisplayName(limit.api_type)}</span>
                  <Badge variant={limit.is_unlimited ? "default" : "secondary"}>
                    {limit.is_unlimited ? "Unlimited" : `${limit.daily_limit} calls/day`}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Global daily limit for {getApiDisplayName(limit.api_type).toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Unlimited Toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor={`unlimited-${limit.api_type}`} className="text-sm font-medium">
                    Unlimited Access
                  </Label>
                  <Switch
                    id={`unlimited-${limit.api_type}`}
                    checked={limit.is_unlimited}
                    onCheckedChange={(checked) => updateLimit(limit.api_type, 'is_unlimited', checked)}
                  />
                </div>

                {/* Daily Limit Input */}
                {!limit.is_unlimited && (
                  <div className="space-y-2">
                    <Label htmlFor={`limit-${limit.api_type}`} className="text-sm font-medium">
                      Daily Limit
                    </Label>
                    <Input
                      id={`limit-${limit.api_type}`}
                      type="number"
                      min="1"
                      max="10000"
                      value={limit.daily_limit}
                      onChange={(e) => updateLimit(limit.api_type, 'daily_limit', parseInt(e.target.value) || 200)}
                      placeholder="200"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum number of API calls per day per user
                    </p>
                  </div>
                )}

                {/* Last Updated */}
                <div className="text-xs text-muted-foreground">
                  Last updated: {new Date(limit.updated_at).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={saveLimits} 
            disabled={saving}
            size="lg"
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  How Global Limits Work
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                  • Global limits apply to all users by default<br/>
                  • Individual user limits can override global limits<br/>
                  • Changes take effect immediately for new API calls<br/>
                  • Existing usage records will use the new limits on next API call
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
