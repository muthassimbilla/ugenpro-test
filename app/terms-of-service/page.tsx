"use client"
import { memo } from "react"
import { FileText, Scale, AlertCircle, Shield, Users, Ban, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const TermsOfServicePage = memo(function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Scale className="h-12 w-12 text-green-600 dark:text-green-400 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Terms of Service
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Please read these terms carefully before using UGen Pro. By using our services, you agree to be bound by
            these terms.
          </p>
          <Badge variant="outline" className="mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>

        {/* Introduction */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-green-600" />
              Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service ("Terms") govern your use of UGen Pro's website and services. By accessing or using
              our platform, you agree to be bound by these Terms and our Privacy Policy.
            </p>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Service Description
            </CardTitle>
            <CardDescription>What UGen Pro provides and how it works</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400">Our Services</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Advanced generator tools for various purposes</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>User agent generation and management</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Address generation tools</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Email to name conversion services</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Secure account management and monitoring</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Eligibility */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-purple-600" />
              User Eligibility & Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-purple-600 dark:text-purple-400">
                Registration Requirements
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>You must be at least 18 years old to use our services</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Only Gmail addresses (@gmail.com) are accepted for registration</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>You must provide accurate and complete information</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>All accounts require admin approval before activation</span>
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3 text-purple-600 dark:text-purple-400">Account Security</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>You are responsible for maintaining account security</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Keep your password confidential and secure</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Notify us immediately of any unauthorized access</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>We monitor device access for security purposes</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Acceptable Use */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-emerald-600" />
              Acceptable Use Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-emerald-600 dark:text-emerald-400">Permitted Uses</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Legitimate testing and development purposes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Educational and research activities</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Personal productivity and automation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Compliance with applicable laws and regulations</span>
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">Prohibited Uses</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <XCircle className="h-4 w-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Illegal activities or violation of laws</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-4 w-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Fraud, deception, or malicious activities</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-4 w-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Spam, harassment, or abuse of others</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-4 w-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Attempting to circumvent security measures</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-4 w-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Commercial use without permission</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-4 w-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Creating multiple accounts to bypass restrictions</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-orange-600" />
              Account Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-orange-600 dark:text-orange-400">Account Status</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • <strong>Pending:</strong> Awaiting admin approval
                  </li>
                  <li>
                    • <strong>Active:</strong> Full access granted
                  </li>
                  <li>
                    • <strong>Suspended:</strong> Temporary restriction
                  </li>
                  <li>
                    • <strong>Expired:</strong> Account has expired
                  </li>
                  <li>
                    • <strong>Inactive:</strong> Account deactivated
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-orange-600 dark:text-orange-400">Account Actions</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Update profile information</li>
                  <li>• Change password and security settings</li>
                  <li>• View device access history</li>
                  <li>• Request account deletion</li>
                  <li>• Contact support for issues</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Availability */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
              Service Availability & Limitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Service Availability</h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                  We strive to maintain 99.9% uptime, but we cannot guarantee uninterrupted service. We may perform
                  maintenance, updates, or experience technical issues.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-amber-600 dark:text-amber-400">Usage Limitations</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Reasonable usage limits may apply to prevent abuse</li>
                  <li>• Rate limiting for API endpoints</li>
                  <li>• Storage limits for generated content</li>
                  <li>• Concurrent session limitations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Ban className="h-5 w-5 mr-2 text-red-600" />
              Account Termination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">Termination by You</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• You may close your account at any time</li>
                  <li>• Contact support to request deletion</li>
                  <li>• Data will be deleted within 30 days</li>
                  <li>• Some data may be retained for legal compliance</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">Termination by Us</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Violation of these Terms</li>
                  <li>• Fraudulent or illegal activity</li>
                  <li>• Extended inactivity (12+ months)</li>
                  <li>• Security threats or abuse</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-gray-600" />
              Disclaimers & Limitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg border border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Service Disclaimer</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Our services are provided "as is" without warranties of any kind. We do not guarantee the accuracy,
                  reliability, or suitability of generated content for any specific purpose.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-600 dark:text-gray-400">Limitation of Liability</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• We are not liable for indirect or consequential damages</li>
                  <li>• Total liability is limited to the amount paid for services</li>
                  <li>• We are not responsible for third-party actions</li>
                  <li>• Use generated content at your own risk</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-indigo-600" />
              Changes to Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms from time to time. We will notify users of significant changes via email or
              through our platform. Continued use of our services after changes constitutes acceptance of the new Terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> legal@ugenpro.com
              </p>
              <p>
                <strong>Support:</strong> support@ugenpro.com
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
            These Terms of Service are effective as of {new Date().toLocaleDateString()} and govern your use of UGen Pro
            services. By using our platform, you acknowledge that you have read, understood, and agree to be bound by
            these terms.
          </p>
        </div>
      </div>
    </div>
  )
})

export default TermsOfServicePage
