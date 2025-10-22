"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/lib/admin-auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Percent,
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle,
  Copy,
  Check,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Coupon {
  id: string
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  max_uses: number | null
  current_uses: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
  applicable_plans: string[] | null
  created_at: string
  updated_at: string
}

export default function AdminCouponsPage() {
  const { admin, isLoading: isAuthLoading } = useAdminAuth()
  const router = useRouter()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    id: "",
    code: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    max_uses: "",
    valid_from: new Date().toISOString().split("T")[0],
    valid_until: "",
    is_active: true,
    applicable_plans: "",
  })

  useEffect(() => {
    if (!isAuthLoading && !admin) {
      router.replace("/404")
    }
  }, [admin, isAuthLoading, router])

  useEffect(() => {
    if (admin) {
      loadCoupons()
    }
  }, [admin])

  const loadCoupons = async () => {
    setIsLoading(true)
    try {
      const sessionToken = localStorage.getItem("admin_session_token")
      if (!sessionToken) return

      const response = await fetch("/api/admin/coupons", {
        headers: { Authorization: `Bearer ${sessionToken}` },
      })

      if (!response.ok) {
        console.error("[v0] Failed to fetch coupons")
        return
      }

      const { coupons: fetchedCoupons } = await response.json()
      setCoupons(fetchedCoupons || [])
    } catch (error) {
      console.error("[v0] Error loading coupons:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      id: "",
      code: "",
      discount_type: "percentage",
      discount_value: "",
      max_uses: "",
      valid_from: new Date().toISOString().split("T")[0],
      valid_until: "",
      is_active: true,
      applicable_plans: "",
    })
    setIsEditing(false)
  }

  const handleCreateCoupon = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleEditCoupon = (coupon: Coupon) => {
    setFormData({
      id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      max_uses: coupon.max_uses?.toString() || "",
      valid_from: coupon.valid_from.split("T")[0],
      valid_until: coupon.valid_until ? coupon.valid_until.split("T")[0] : "",
      is_active: coupon.is_active,
      applicable_plans: coupon.applicable_plans?.join(", ") || "",
    })
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleSaveCoupon = async () => {
    if (!formData.code.trim() || !formData.discount_value) {
      alert("কুপন কোড এবং ছাড়ের পরিমাণ প্রয়োজন")
      return
    }

    setIsSaving(true)
    try {
      const sessionToken = localStorage.getItem("admin_session_token")
      if (!sessionToken) return

      const payload = {
        code: formData.code.toUpperCase().trim(),
        discount_type: formData.discount_type,
        discount_value: Number.parseFloat(formData.discount_value),
        max_uses: formData.max_uses ? Number.parseInt(formData.max_uses) : null,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until || null,
        is_active: formData.is_active,
        applicable_plans: formData.applicable_plans ? formData.applicable_plans.split(",").map((p) => p.trim()) : null,
      }

      const url = isEditing ? `/api/admin/coupons/${formData.id}` : "/api/admin/coupons"
      const method = isEditing ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "কুপন সংরক্ষণ করতে সমস্যা হয়েছে")
        return
      }

      await loadCoupons()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("[v0] Error saving coupon:", error)
      alert("কুপন সংরক্ষণ করতে সমস্যা হয়েছে")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm("আপনি কি এই কুপনটি মুছে ফেলতে চান?")) return

    try {
      const sessionToken = localStorage.getItem("admin_session_token")
      if (!sessionToken) return

      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` },
      })

      if (!response.ok) {
        alert("কুপন মুছতে সমস্যা হয়েছে")
        return
      }

      await loadCoupons()
    } catch (error) {
      console.error("[v0] Error deleting coupon:", error)
      alert("কুপন মুছতে সমস্যা হয়েছে")
    }
  }

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const sessionToken = localStorage.getItem("admin_session_token")
      if (!sessionToken) return

      const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ is_active: !coupon.is_active }),
      })

      if (!response.ok) {
        alert("কুপন আপডেট করতে সমস্যা হয়েছে")
        return
      }

      await loadCoupons()
    } catch (error) {
      console.error("[v0] Error toggling coupon:", error)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (!isAuthLoading && !admin) {
    return null
  }

  const activeCoupons = coupons.filter((c) => c.is_active)
  const totalUsage = coupons.reduce((sum, c) => sum + c.current_uses, 0)

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Tag className="h-8 w-8 text-primary" />
            Coupon Management
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage discount coupons</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadCoupons} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateCoupon}>
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Coupons</p>
                <p className="text-3xl font-bold text-blue-600">{coupons.length}</p>
              </div>
              <Tag className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Coupons</p>
                <p className="text-3xl font-bold text-green-600">{activeCoupons.length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Usage</p>
                <p className="text-3xl font-bold text-purple-600">{totalUsage}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No coupons found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-sm bg-muted px-2 py-1 rounded">{coupon.code}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(coupon.code)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {coupon.discount_type === "percentage" ? (
                            <>
                              <Percent className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold">{coupon.discount_value}%</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="font-semibold">৳{coupon.discount_value}</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-semibold">{coupon.current_uses}</span>
                          {coupon.max_uses && <span className="text-muted-foreground"> / {coupon.max_uses}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {coupon.valid_until ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formatDistanceToNow(new Date(coupon.valid_until), { addSuffix: true })}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No expiry</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={coupon.is_active} onCheckedChange={() => handleToggleActive(coupon)} />
                          <Badge variant={coupon.is_active ? "default" : "secondary"}>
                            {coupon.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditCoupon(coupon)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update coupon details below" : "Fill in the details to create a new coupon"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Coupon Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SAVE20"
                className="uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount_type">Discount Type *</Label>
                <select
                  id="discount_type"
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (৳)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="discount_value">Discount Value *</Label>
                <Input
                  id="discount_value"
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  placeholder={formData.discount_type === "percentage" ? "20" : "500"}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="max_uses">Maximum Uses (leave empty for unlimited)</Label>
              <Input
                id="max_uses"
                type="number"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                placeholder="100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valid_from">Valid From</Label>
                <Input
                  id="valid_from"
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="valid_until">Valid Until (optional)</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="applicable_plans">Applicable Plans (comma-separated, leave empty for all)</Label>
              <Input
                id="applicable_plans"
                value={formData.applicable_plans}
                onChange={(e) => setFormData({ ...formData, applicable_plans: e.target.value })}
                placeholder="1-month, 3-months, 6-months"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveCoupon} disabled={isSaving} className="flex-1">
                {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                {isEditing ? "Update Coupon" : "Create Coupon"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
