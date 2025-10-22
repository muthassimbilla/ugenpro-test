"use client"
import { memo } from "react"
import { Shield, Eye, Lock, Database, Users, Globe, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const PrivacyPolicyPage = memo(function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <Badge variant="outline" className="mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>

        {/* Introduction */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2 text-blue-600" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              UGen Pro ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how
              we collect, use, disclose, and safeguard your information when you use our platform and services.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-green-600" />
              Information We Collect
            </CardTitle>
            <CardDescription>We collect information to provide and improve our services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400">Personal Information</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    <strong>Full Name:</strong> Required for account creation and personalization
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    <strong>Email Address:</strong> Only Gmail addresses (@gmail.com) are accepted for account
                    verification and communication
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    <strong>Password:</strong> Securely hashed and stored for authentication
                  </span>
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">Technical Information</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    <strong>IP Address:</strong> Collected for security monitoring and device tracking
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    <strong>User Agent:</strong> Browser and device information for compatibility
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    <strong>Session Data:</strong> Login sessions, timestamps, and activity logs
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    <strong>Device Count:</strong> Number of unique devices used to access your account
                  </span>
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3 text-purple-600 dark:text-purple-400">Usage Information</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    <strong>Tool Usage:</strong> Which tools you use and how often
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    <strong>Generated Content:</strong> Data generated using our tools (temporarily stored)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    <strong>Performance Data:</strong> App performance metrics and error logs
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-orange-600" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400">Service Provision</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Account creation and management</li>
                  <li>• Tool access and functionality</li>
                  <li>• User authentication and security</li>
                  <li>• Customer support and communication</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400">Security & Monitoring</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Fraud prevention and detection</li>
                  <li>• Account security monitoring</li>
                  <li>• Device tracking and management</li>
                  <li>• Compliance with legal requirements</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2 text-red-600" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">Security Measures</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• End-to-end encryption for data transmission</li>
                  <li>• Secure password hashing (bcrypt)</li>
                  <li>• Row-level security (RLS) in database</li>
                  <li>• Regular security audits and updates</li>
                  <li>• IP-based access monitoring</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">Data Storage</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Supabase secure cloud database</li>
                  <li>• Encrypted data at rest</li>
                  <li>• Regular automated backups</li>
                  <li>• GDPR compliant data handling</li>
                  <li>• Limited data retention periods</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-indigo-600" />
              Data Sharing & Disclosure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  We Do NOT Share Your Personal Data
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your
                  explicit consent, except as described in this policy.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-indigo-600 dark:text-indigo-400">Limited Exceptions</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Legal compliance and law enforcement requests</li>
                  <li>• Protection of our rights and safety</li>
                  <li>• Business transfers (merger, acquisition)</li>
                  <li>• Service providers (under strict confidentiality)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-emerald-600" />
              Your Privacy Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-emerald-600 dark:text-emerald-400">Access & Control</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• View your personal data</li>
                  <li>• Update account information</li>
                  <li>• Change password and security settings</li>
                  <li>• Download your data</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-emerald-600 dark:text-emerald-400">Data Management</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Request data deletion</li>
                  <li>• Opt-out of communications</li>
                  <li>• Manage device access</li>
                  <li>• Close your account</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notices */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
              Important Notices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Gmail Only Policy</h3>
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                We only accept Gmail addresses for account registration. This helps us maintain security and prevent
                spam accounts.
              </p>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Admin Approval Required</h3>
              <p className="text-red-700 dark:text-red-300 text-sm">
                All new accounts require admin approval before full access is granted. This ensures platform security
                and quality.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> privacy@ugenpro.com
              </p>
              <p>
                <strong>Website:</strong> https://ugenpro.com
              </p>
              <p>
                <strong>Response Time:</strong> Within 48 hours
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            This Privacy Policy is effective as of {new Date().toLocaleDateString()} and may be updated periodically. We
            will notify users of any significant changes.
          </p>
        </div>
      </div>
    </div>
  )
})

export default PrivacyPolicyPage
