"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ShoppingCart,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  CreditCard,
  Tag,
  FileText,
  AlertCircle,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import SimpleHeader from "@/components/simple-header"

interface Order {
  id: string
  plan_id: string
  plan_name: string
  original_price: number
  discount_amount: number
  final_price: number
  coupon_code: string | null
  user_name: string
  user_email: string
  payment_method: string | null
  payment_last_4_digits: string | null
  payment_transaction_id: string | null
  payment_status: string
  order_status: string
  notes: string | null
  created_at: string
  updated_at: string
}

export default function PremiumToolsOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    checkAuthAndLoadOrders()
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const checkAuthAndLoadOrders = async () => {
    setIsLoading(true)
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        router.push("/login")
        return
      }

      setUser(currentUser)

      const { data: userOrders, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error fetching orders:", error)
        return
      }

      setOrders(userOrders || [])
    } catch (error) {
      console.error("[v0] Error loading orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }
    > = {
      pending: { label: "Pending", variant: "secondary", icon: Clock },
      confirmed: { label: "Confirmed", variant: "default", icon: CheckCircle },
      processing: { label: "Processing", variant: "outline", icon: RefreshCw },
      completed: { label: "Completed", variant: "default", icon: CheckCircle },
      cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return "N/A"
    const methods: Record<string, string> = {
      bkash: "bKash",
      nagad: "Nagad",
      rocket: "Rocket",
    }
    return methods[method] || method
  }

  const pendingOrders = orders.filter((o) => o.order_status === "pending")
  const completedOrders = orders.filter((o) => o.order_status === "completed" || o.order_status === "confirmed")

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <SimpleHeader />

      {/* Main Content */}
      <div className="relative z-10 px-6 py-12 pt-24">
        <div className="max-w-6xl mx-auto">
          <div
            className={`space-y-6 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <ShoppingCart className="h-7 w-7 text-white" />
                  </div>
                  My Orders
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">View all your orders and their status</p>
              </div>
              <Button
                onClick={checkAuthAndLoadOrders}
                variant="outline"
                disabled={isLoading}
                className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border-2 border-purple-200/50 dark:border-purple-500/30"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border-2 border-blue-200/50 dark:border-blue-500/30 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Total Orders</p>
                      <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
                    </div>
                    <Package className="h-10 w-10 text-blue-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border-2 border-orange-200/50 dark:border-orange-500/30 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
                      <p className="text-3xl font-bold text-orange-600">{pendingOrders.length}</p>
                    </div>
                    <Clock className="h-10 w-10 text-orange-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border-2 border-green-200/50 dark:border-green-500/30 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
                      <p className="text-3xl font-bold text-green-600">{completedOrders.length}</p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-green-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {isLoading ? (
              <Card className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border-2 border-purple-200/50 dark:border-purple-500/30 shadow-xl">
                <CardContent className="p-12">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <RefreshCw className="h-12 w-12 animate-spin text-purple-600" />
                    <p className="text-slate-600 dark:text-slate-400">Loading orders...</p>
                  </div>
                </CardContent>
              </Card>
            ) : orders.length === 0 ? (
              <Card className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border-2 border-purple-200/50 dark:border-purple-500/30 shadow-xl">
                <CardContent className="p-12">
                  <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full">
                      <ShoppingCart className="h-12 w-12 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        No Orders Yet
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">You haven't placed any orders yet</p>
                      <Button
                        onClick={() => router.push("/premium-tools")}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        View Packages
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card
                    key={order.id}
                    className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border-2 border-purple-200/50 dark:border-purple-500/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                            <Package className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                                  {order.plan_name}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                  Order ID: {order.id.slice(0, 8)}...
                                </p>
                              </div>
                              {getStatusBadge(order.order_status)}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">Price</p>
                                <p className="font-semibold text-blue-600">৳{order.final_price}</p>
                              </div>
                              {order.discount_amount > 0 && (
                                <div>
                                  <p className="text-slate-500 dark:text-slate-400 text-xs">Discount</p>
                                  <p className="font-semibold text-green-600">৳{order.discount_amount}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">Payment</p>
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                  {getPaymentMethodLabel(order.payment_method)}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">Date</p>
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                  {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                                </p>
                              </div>
                            </div>

                            {order.order_status === "pending" && (
                              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg backdrop-blur-sm">
                                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-900 dark:text-amber-100">
                                  Your order is being verified. You will receive confirmation within 24 hours.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          onClick={() => {
                            setSelectedOrder(order)
                            setIsDetailsOpen(true)
                          }}
                          variant="outline"
                          size="sm"
                          className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border-2 border-purple-200/50 dark:border-purple-500/30"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </DialogTitle>
            <DialogDescription>Order ID: {selectedOrder?.id}</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-2 border-purple-200/50 dark:border-purple-500/30">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-purple-200 dark:border-purple-800">
                    <Package className="h-4 w-4" />
                    <span className="font-semibold">Package Information</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Package Name:</span>
                    <span className="font-semibold">{selectedOrder.plan_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Original Price:</span>
                    <span>৳{selectedOrder.original_price}</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-৳{selectedOrder.discount_amount}</span>
                      </div>
                      {selectedOrder.coupon_code && (
                        <div className="flex items-center gap-2 text-sm">
                          <Tag className="h-4 w-4" />
                          <span>Coupon: {selectedOrder.coupon_code}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between pt-3 border-t border-purple-200 dark:border-purple-800 font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-blue-600">৳{selectedOrder.final_price}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-2 border-green-200/50 dark:border-green-500/30">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-green-200 dark:border-green-800">
                    <CreditCard className="h-4 w-4" />
                    <span className="font-semibold">Payment Information</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Payment Method:</span>
                    <span className="font-medium">{getPaymentMethodLabel(selectedOrder.payment_method)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Last 4 Digits:</span>
                    <span className="font-mono">****{selectedOrder.payment_last_4_digits}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Transaction ID:</span>
                    <span className="font-mono text-sm text-right break-all max-w-[60%]">
                      {selectedOrder.payment_transaction_id}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-green-200 dark:border-green-800">
                    <span className="text-slate-600 dark:text-slate-400">Payment Status:</span>
                    {getStatusBadge(selectedOrder.payment_status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Order Status:</span>
                    {getStatusBadge(selectedOrder.order_status)}
                  </div>
                </CardContent>
              </Card>

              {selectedOrder.notes && (
                <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/50 dark:to-slate-900/50 border-2 border-slate-200/50 dark:border-slate-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-semibold">Additional Notes</span>
                    </div>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/50 dark:to-slate-900/50 border-2 border-slate-200/50 dark:border-slate-500/30">
                <CardContent className="p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Order Date:</span>
                    <span>{new Date(selectedOrder.created_at).toLocaleString("en-US")}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
