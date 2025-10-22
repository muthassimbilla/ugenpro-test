"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/lib/admin-auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Tag, TrendingUp, DollarSign, Percent, RefreshCw, Award, Calendar } from "lucide-react"

interface AnalyticsData {
  summary: {
    totalCoupons: number
    activeCoupons: number
    totalRedemptions: number
    totalDiscountGiven: number
  }
  topCoupons: Array<{
    code: string
    uses: number
    totalDiscount: number
    revenue: number
  }>
  monthlyUsage: Array<{
    month: string
    uses: number
    discount: number
  }>
  discountTypeBreakdown: {
    percentage: number
    fixed: number
  }
}

export default function CouponAnalyticsPage() {
  const { admin, isLoading: isAuthLoading } = useAdminAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthLoading && !admin) {
      router.replace("/404")
    }
  }, [admin, isAuthLoading, router])

  useEffect(() => {
    if (admin) {
      loadAnalytics()
    }
  }, [admin])

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      const sessionToken = localStorage.getItem("admin_session_token")
      if (!sessionToken) return

      const response = await fetch("/api/admin/coupon-analytics", {
        headers: { Authorization: `Bearer ${sessionToken}` },
      })

      if (!response.ok) {
        console.error("[v0] Failed to fetch analytics")
        return
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("[v0] Error loading analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthLoading && !admin) {
    return null
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart className="h-8 w-8 text-primary" />
            Coupon Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Track coupon performance and usage statistics</p>
        </div>
        <Button onClick={loadAnalytics} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : analytics ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Coupons</p>
                    <p className="text-3xl font-bold text-blue-600">{analytics.summary.totalCoupons}</p>
                    <p className="text-xs text-muted-foreground mt-1">{analytics.summary.activeCoupons} active</p>
                  </div>
                  <Tag className="h-10 w-10 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Redemptions</p>
                    <p className="text-3xl font-bold text-green-600">{analytics.summary.totalRedemptions}</p>
                    <p className="text-xs text-muted-foreground mt-1">All time</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Discount Given</p>
                    <p className="text-3xl font-bold text-orange-600">৳{analytics.summary.totalDiscountGiven}</p>
                    <p className="text-xs text-muted-foreground mt-1">Revenue impact</p>
                  </div>
                  <DollarSign className="h-10 w-10 text-orange-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Discount</p>
                    <p className="text-3xl font-bold text-purple-600">
                      ৳
                      {analytics.summary.totalRedemptions > 0
                        ? Math.round(analytics.summary.totalDiscountGiven / analytics.summary.totalRedemptions)
                        : 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Per redemption</p>
                  </div>
                  <Percent className="h-10 w-10 text-purple-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Discount Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Discount Type Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900 dark:text-blue-100">Percentage Coupons</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{analytics.discountTypeBreakdown.percentage}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {analytics.summary.totalCoupons > 0
                      ? Math.round((analytics.discountTypeBreakdown.percentage / analytics.summary.totalCoupons) * 100)
                      : 0}
                    % of total
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900 dark:text-green-100">Fixed Amount Coupons</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{analytics.discountTypeBreakdown.fixed}</p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    {analytics.summary.totalCoupons > 0
                      ? Math.round((analytics.discountTypeBreakdown.fixed / analytics.summary.totalCoupons) * 100)
                      : 0}
                    % of total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Coupons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Performing Coupons
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.topCoupons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Tag className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No coupon usage data available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Coupon Code</TableHead>
                        <TableHead>Total Uses</TableHead>
                        <TableHead>Total Discount</TableHead>
                        <TableHead>Revenue Generated</TableHead>
                        <TableHead>Avg. Discount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.topCoupons.map((coupon, index) => (
                        <TableRow key={coupon.code}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {index === 0 && <Award className="h-4 w-4 text-yellow-500" />}
                              {index === 1 && <Award className="h-4 w-4 text-gray-400" />}
                              {index === 2 && <Award className="h-4 w-4 text-orange-600" />}
                              <span className="font-semibold">#{index + 1}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="font-mono font-bold text-sm bg-muted px-2 py-1 rounded">
                              {coupon.code}
                            </code>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-blue-600">{coupon.uses}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-orange-600">৳{coupon.totalDiscount}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-600">৳{coupon.revenue}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">
                              ৳{coupon.uses > 0 ? Math.round(coupon.totalDiscount / coupon.uses) : 0}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Usage Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Usage Trend (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.monthlyUsage.map((month) => (
                  <div key={month.month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{month.month}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                          <span className="font-semibold text-blue-600">{month.uses}</span> uses
                        </span>
                        <span className="text-muted-foreground">
                          <span className="font-semibold text-orange-600">৳{month.discount}</span> discount
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min((month.uses / Math.max(...analytics.monthlyUsage.map((m) => m.uses))) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-muted-foreground">
              <BarChart className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Failed to load analytics data</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
