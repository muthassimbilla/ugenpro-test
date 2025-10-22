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

export default function UserOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuthAndLoadOrders()
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
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <ShoppingCart className="h-7 w-7 text-blue-600" />
                </div>
                My Orders
              </h1>
              <p className="text-muted-foreground mt-2">View all your orders and their status</p>
            </div>
            <Button onClick={checkAuthAndLoadOrders} variant="outline" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
                  </div>
                  <Package className="h-10 w-10 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-3xl font-bold text-orange-600">{pendingOrders.length}</p>
                  </div>
                  <Clock className="h-10 w-10 text-orange-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{completedOrders.length}</p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {isLoading ? (
            <Card className="glass-card border-0">
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <RefreshCw className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading orders...</p>
                </div>
              </CardContent>
            </Card>
          ) : orders.length === 0 ? (
            <Card className="glass-card border-0">
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <div className="p-4 bg-muted rounded-full">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
                    <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
                    <Button onClick={() => router.push("/pricing")}>View Packages</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="glass-card border-0 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                          <Package className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-lg">{order.plan_name}</h3>
                              <p className="text-xs text-muted-foreground font-mono">
                                Order ID: {order.id.slice(0, 8)}...
                              </p>
                            </div>
                            {getStatusBadge(order.order_status)}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs">Price</p>
                              <p className="font-semibold text-blue-600">৳{order.final_price}</p>
                            </div>
                            {order.discount_amount > 0 && (
                              <div>
                                <p className="text-muted-foreground text-xs">Discount</p>
                                <p className="font-semibold text-green-600">৳{order.discount_amount}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-muted-foreground text-xs">Payment</p>
                              <p className="font-medium">{getPaymentMethodLabel(order.payment_method)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Date</p>
                              <p className="font-medium">
                                {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>

                          {order.order_status === "pending" && (
                            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
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

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </DialogTitle>
            <DialogDescription>Order ID: {selectedOrder?.id}</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <Card className="glass-card border-0">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Package className="h-4 w-4" />
                    <span className="font-semibold">Package Information</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Package Name:</span>
                    <span className="font-semibold">{selectedOrder.plan_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Original Price:</span>
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
                  <div className="flex justify-between pt-3 border-t font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-blue-600">৳{selectedOrder.final_price}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <CreditCard className="h-4 w-4" />
                    <span className="font-semibold">Payment Information</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="font-medium">{getPaymentMethodLabel(selectedOrder.payment_method)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last 4 Digits:</span>
                    <span className="font-mono">****{selectedOrder.payment_last_4_digits}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <span className="font-mono text-sm text-right break-all max-w-[60%]">
                      {selectedOrder.payment_transaction_id}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Payment Status:</span>
                    {getStatusBadge(selectedOrder.payment_status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Status:</span>
                    {getStatusBadge(selectedOrder.order_status)}
                  </div>
                </CardContent>
              </Card>

              {selectedOrder.notes && (
                <Card className="glass-card border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 pb-2 border-b mb-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-semibold">Additional Notes</span>
                    </div>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}

              <Card className="glass-card border-0">
                <CardContent className="p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Date:</span>
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
