"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Bug, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface DebugResult {
  timestamp: string
  responseTime: string
  environment: {
    hasApiKey: boolean
    apiKeyPreview: string
    nodeEnv: string
  }
  testEmail: string
  apiTest: any
  apiError: any
  recommendations: string[]
}

export default function Email2NameDebugPage() {
  const [testEmail, setTestEmail] = useState("test@example.com")
  const [isLoading, setIsLoading] = useState(false)
  const [debugResult, setDebugResult] = useState<DebugResult | null>(null)

  const runDebugTest = async () => {
    setIsLoading(true)
    setDebugResult(null)
    
    try {
      const response = await fetch(`/api/debug/email2name?email=${encodeURIComponent(testEmail)}`)
      const data = await response.json()
      
      if (data.status === "success") {
        setDebugResult(data.debug)
        toast.success("Debug test completed")
      } else {
        toast.error("Debug test failed")
      }
    } catch (error) {
      toast.error("Failed to run debug test")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (hasApiKey: boolean, apiError: any, apiTest: any) => {
    if (!hasApiKey) return <XCircle className="h-5 w-5 text-red-500" />
    if (apiError) return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    if (apiTest) return <CheckCircle className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-gray-500" />
  }

  const getStatusText = (hasApiKey: boolean, apiError: any, apiTest: any) => {
    if (!hasApiKey) return "API Key Missing"
    if (apiError) return "API Error"
    if (apiTest) return "API Working"
    return "Unknown"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-orange-500" />
              Email2Name API Debug Tool
            </CardTitle>
            <CardDescription>
              Test and diagnose Email2Name API issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="test-email">Test Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="test-email"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={runDebugTest} 
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Testing...
                    </>
                  ) : (
                    "Run Test"
                  )}
                </Button>
              </div>
            </div>

            {debugResult && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Test Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Status Overview */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {getStatusIcon(debugResult.environment.hasApiKey, debugResult.apiError, debugResult.apiTest)}
                      <div>
                        <div className="font-medium">
                          {getStatusText(debugResult.environment.hasApiKey, debugResult.apiError, debugResult.apiTest)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Response Time: {debugResult.responseTime} | Tested: {debugResult.testEmail}
                        </div>
                      </div>
                    </div>

                    {/* Environment Info */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Environment</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">API Key:</span> {debugResult.environment.apiKeyPreview}
                        </div>
                        <div>
                          <span className="font-medium">Node Env:</span> {debugResult.environment.nodeEnv}
                        </div>
                      </div>
                    </div>

                    {/* API Test Results */}
                    {debugResult.apiTest && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-green-700">API Test Success</h4>
                        <div className="bg-green-50 p-3 rounded text-sm">
                          <div>Status: {debugResult.apiTest.status} {debugResult.apiTest.statusText}</div>
                          <div className="mt-2">
                            <span className="font-medium">Response:</span>
                            <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto">
                              {JSON.stringify(debugResult.apiTest.response, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* API Error */}
                    {debugResult.apiError && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-red-700">API Error</h4>
                        <div className="bg-red-50 p-3 rounded text-sm">
                          <div>Status: {debugResult.apiError.status} {debugResult.apiError.statusText}</div>
                          <div className="mt-2">
                            <span className="font-medium">Error Details:</span>
                            <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto">
                              {JSON.stringify(debugResult.apiError, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {debugResult.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Recommendations</h4>
                        <ul className="space-y-1">
                          {debugResult.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <span className="text-blue-500 mt-0.5">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
