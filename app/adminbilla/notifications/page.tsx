"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/lib/admin-auth-context"
import {
  Bell,
  Send,
  Users,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  User,
  Clock,
  Plus,
  Eye,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { AdminUserService, type AdminUser } from "@/lib/admin-user-service"

interface NotificationData {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  is_read: boolean
  link?: string
  created_at: string
  read_at?: string
  user?: {
    full_name: string
    telegram_username: string
  }
}

export default function AdminNotificationsPage() {
  const { admin, isLoading } = useAdminAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [sendToAll, setSendToAll] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info" as "info" | "success" | "warning" | "error",
    link: "",
  })
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("custom")

  useEffect(() => {
    if (!isLoading && !admin) {
      router.replace("/404")
    }
  }, [admin, isLoading, router])

  useEffect(() => {
    if (admin) {
      loadUsers()
      loadNotifications()
      loadTemplates()
    }
  }, [admin])

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true)
      const usersData = await AdminUserService.getAllUsers()
      setUsers(Array.isArray(usersData) ? usersData : usersData.users || [])
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "ত্রুটি",
        description: "ইউজার তালিকা লোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      })
      setUsers([])
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const loadNotifications = async () => {
    try {
      setIsLoadingNotifications(true)
      const sessionToken = typeof window !== "undefined" ? localStorage.getItem("admin_session_token") : null

      const response = await fetch("/api/admin/notifications-history", {
        headers: {
          Authorization: `Bearer ${sessionToken || ""}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      } else {
        console.error("Failed to load notifications:", response.status, await response.text())
        toast({
          title: "ত্রুটি",
          description: "নোটিফিকেশন লোড করতে সমস্যা হয়েছে",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading notifications:", error)
      toast({
        title: "ত্রুটি",
        description: "নোটিফিকেশন লোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      })
    } finally {
      setIsLoadingNotifications(false)
    }
  }

  const loadTemplates = async () => {
    try {
      const sessionToken = typeof window !== "undefined" ? localStorage.getItem("admin_session_token") : null

      const response = await fetch("/api/admin/bulk-notifications", {
        headers: {
          Authorization: `Bearer ${sessionToken || ""}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      } else {
        console.error("Failed to load templates:", response.status, await response.text())
      }
    } catch (error) {
      console.error("Error loading templates:", error)
    }
  }

  const sendNotification = async () => {
    if (!formData.title || !formData.message) {
      toast({
        title: "ত্রুটি",
        description: "শিরোনাম এবং বার্তা প্রয়োজন",
        variant: "destructive",
      })
      return
    }

    if (!sendToAll && selectedUsers.length === 0) {
      toast({
        title: "ত্রুটি",
        description: "অন্তত একজন ইউজার নির্বাচন করুন",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      const usersToNotify = sendToAll ? users.map((u) => u.id) : selectedUsers

      console.log("[v0] sendToAll:", sendToAll)
      console.log("[v0] selectedUsers:", selectedUsers)
      console.log("[v0] usersToNotify:", usersToNotify)
      console.log("[v0] Total users to notify:", usersToNotify.length)

      const sessionToken = typeof window !== "undefined" ? localStorage.getItem("admin_session_token") : null

      const requestBody = {
        userIds: usersToNotify,
        title: formData.title,
        message: formData.message,
        type: formData.type,
        link: formData.link || undefined,
        sendToAll,
      }

      console.log("[v0] Request body:", JSON.stringify(requestBody, null, 2))

      const response = await fetch("/api/admin/bulk-notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken || ""}`,
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()
      console.log("[v0] Response:", result)

      if (response.ok) {
        const successCount = result.count || 0

        toast({
          title: "সফল",
          description: `${successCount}টি নোটিফিকেশন পাঠানো হয়েছে`,
        })

        setFormData({ title: "", message: "", type: "info", link: "" })
        setSelectedUsers([])
        setSendToAll(false)
        setSelectedTemplate("custom")
        setIsCreateDialogOpen(false)
        loadNotifications()
      } else {
        console.error("[v0] Failed to send notifications:", result.error)
        toast({
          title: "ত্রুটি",
          description: result.error || "নোটিফিকেশন পাঠাতে সমস্যা হয়েছে",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error sending notifications:", error)
      toast({
        title: "ত্রুটি",
        description: "নোটিফিকেশন পাঠাতে সমস্যা হয়েছে",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setFormData({
        title: template.title,
        message: template.message,
        type: template.type,
        link: template.link || "",
      })
      setSelectedTemplate(templateId)
    }
  }

  const filteredUsers = Array.isArray(users)
    ? users.filter(
        (user) =>
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.telegram_username && user.telegram_username.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    : []

  const filteredNotifications = notifications.filter((notification) => {
    if (filterType === "all") return true
    return notification.type === filterType
  })

  if (isLoading || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="border rounded-lg p-6 bg-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">নোটিফিকেশন ম্যানেজমেন্ট</h1>
                <p className="text-sm text-muted-foreground">ইউজারদের নোটিফিকেশন পাঠান এবং পরিচালনা করুন</p>
              </div>
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                নতুন নোটিফিকেশন
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>নতুন নোটিফিকেশন তৈরি করুন</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template">টেমপ্লেট (ঐচ্ছিক)</Label>
                  <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="পূর্বনির্ধারিত টেমপ্লেট নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">কাস্টম নোটিফিকেশন</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">শিরোনাম *</Label>
                    <Input
                      id="title"
                      placeholder="নোটিফিকেশনের শিরোনাম"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">ধরন</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="নোটিফিকেশনের ধরন নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">তথ্য</SelectItem>
                        <SelectItem value="success">সফল</SelectItem>
                        <SelectItem value="warning">সতর্কতা</SelectItem>
                        <SelectItem value="error">ত্রুটি</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">বার্তা *</Label>
                  <Textarea
                    id="message"
                    placeholder="নোটিফিকেশনের বিস্তারিত বার্তা"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">লিংক (ঐচ্ছিক)</Label>
                  <Input
                    id="link"
                    placeholder="https://example.com"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="send-to-all" checked={sendToAll} onCheckedChange={setSendToAll} />
                    <Label htmlFor="send-to-all">সকল ইউজারের কাছে পাঠান</Label>
                  </div>

                  {!sendToAll && (
                    <div className="space-y-2">
                      <Label>ইউজার নির্বাচন করুন</Label>
                      <Input
                        placeholder="ইউজার খুঁজুন..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div className="max-h-60 overflow-y-auto border rounded-md">
                        {isLoadingUsers ? (
                          <div className="p-4 text-center">
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          </div>
                        ) : filteredUsers.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">কোনো ইউজার পাওয়া যায়নি</div>
                        ) : (
                          filteredUsers.map((user) => {
                            const isSelected = selectedUsers.includes(user.id)
                            return (
                              <div
                                key={user.id}
                                className="flex items-center space-x-2 p-3 hover:bg-muted cursor-pointer"
                                onClick={() => {
                                  console.log("[v0] Clicking user:", user.id, user.full_name)
                                  console.log("[v0] Current selectedUsers:", selectedUsers)
                                  if (selectedUsers.includes(user.id)) {
                                    const newSelected = selectedUsers.filter((id) => id !== user.id)
                                    console.log("[v0] Removing user, new selection:", newSelected)
                                    setSelectedUsers(newSelected)
                                  } else {
                                    const newSelected = [...selectedUsers, user.id]
                                    console.log("[v0] Adding user, new selection:", newSelected)
                                    setSelectedUsers(newSelected)
                                  }
                                }}
                              >
                                <input type="checkbox" checked={isSelected} onChange={() => {}} className="rounded" />
                                <div className="flex-1">
                                  <div className="font-medium">{user.full_name}</div>
                                  <div className="text-sm text-muted-foreground">@{user.telegram_username}</div>
                                </div>
                                <Badge variant={user.current_status === "active" ? "default" : "secondary"}>
                                  {user.current_status}
                                </Badge>
                              </div>
                            )
                          })
                        )}
                      </div>
                      {selectedUsers.length > 0 && (
                        <p className="text-sm text-muted-foreground">{selectedUsers.length}টি ইউজার নির্বাচিত</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    বাতিল
                  </Button>
                  <Button onClick={sendNotification} disabled={isSending}>
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        পাঠানো হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        পাঠান
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">নোটিফিকেশন ইতিহাস</TabsTrigger>
          <TabsTrigger value="stats">পরিসংখ্যান</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>সকল নোটিফিকেশন</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="ফিল্টার" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সকল</SelectItem>
                      <SelectItem value="info">তথ্য</SelectItem>
                      <SelectItem value="success">সফল</SelectItem>
                      <SelectItem value="warning">সতর্কতা</SelectItem>
                      <SelectItem value="error">ত্রুটি</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={loadNotifications}>
                    <Eye className="w-4 h-4 mr-2" />
                    রিফ্রেশ
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingNotifications ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse p-4 rounded-lg bg-muted/50">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      <div key={notification.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getTypeIcon(notification.type)}
                              <h3 className="font-semibold">{notification.title}</h3>
                              <Badge className={getTypeBadgeColor(notification.type)}>{notification.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {notification.user?.full_name || "Unknown User"}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(notification.created_at).toLocaleString("bn-BD")}
                              </div>
                              {notification.is_read && notification.read_at && (
                                <Badge variant="secondary" className="text-xs">
                                  পড়া হয়েছে
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                      <h3 className="font-semibold text-foreground mb-1">কোনো নোটিফিকেশন নেই</h3>
                      <p className="text-sm text-muted-foreground">এখনো কোনো নোটিফিকেশন পাঠানো হয়নি</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mt-4">{notifications.length}</div>
                <div className="text-sm text-muted-foreground">মোট নোটিফিকেশন</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mt-4">
                  {notifications.filter((n) => n.is_read).length}
                </div>
                <div className="text-sm text-muted-foreground">পড়া হয়েছে</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mt-4">
                  {notifications.filter((n) => !n.is_read).length}
                </div>
                <div className="text-sm text-muted-foreground">অপঠিত</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mt-4">{users.length}</div>
                <div className="text-sm text-muted-foreground">মোট ইউজার</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
