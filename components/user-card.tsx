"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Activity,
  Clock,
  CheckCircle,
  UserCheck,
  UserX,
  Eye,
  Monitor,
  Trash2,
  XCircle,
  Smartphone,
} from "lucide-react"
import type { AdminUser } from "@/lib/admin-user-service"

interface UserCardProps {
  user: AdminUser
  onToggleStatus: (userId: string, currentStatus: boolean) => void
  onViewUser: (user: AdminUser) => void
  onViewSessions: (user: AdminUser) => void
  onDeleteUser: (userId: string) => void
  onApproveUser: (user: AdminUser) => void
  onRejectUser: (userId: string) => void
}

const getStatusInfo = (status: string) => {
  switch (status) {
    case "active":
      return { variant: "default" as const, text: "Active", color: "text-green-600" }
    case "suspended":
      return { variant: "destructive" as const, text: "Suspended", color: "text-red-600" }
    case "expired":
      return { variant: "destructive" as const, text: "Expired", color: "text-red-600" }
    case "pending":
      return { variant: "outline" as const, text: "Pending Approval", color: "text-yellow-600" }
    default:
      return { variant: "outline" as const, text: "Unknown", color: "text-gray-600" }
  }
}

export const UserCard = React.memo<UserCardProps>(
  ({ user, onToggleStatus, onViewUser, onViewSessions, onDeleteUser, onApproveUser, onRejectUser }) => {
    const statusInfo = getStatusInfo(user.current_status)

    return (
      <div className="glass-card p-4 lg:p-6 rounded-2xl hover:shadow-lg transition-all duration-300">
        <div className="flex items-start justify-between mb-3 lg:mb-4">
          <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm lg:text-base flex-shrink-0">
              {user.full_name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground text-sm lg:text-base truncate">{user.full_name}</h3>
              <p className="text-xs lg:text-sm text-muted-foreground truncate">
                {user.email || `@${user.telegram_username}` || "No contact info"}
              </p>
            </div>
          </div>
          <Badge variant={statusInfo.variant} className="text-xs flex-shrink-0">
            {statusInfo.text}
          </Badge>
        </div>

        <div className="space-y-1 lg:space-y-2 mb-3 lg:mb-4">
          <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
            <Calendar className="w-3 h-3 lg:w-4 lg:w-4 flex-shrink-0" />
            <span className="truncate">Joined: {new Date(user.created_at).toLocaleDateString("en-US")}</span>
          </div>
          {user.approved_at && (
            <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
              <CheckCircle className="w-3 h-3 lg:w-4 lg:w-4 flex-shrink-0" />
              <span className="truncate">Approved: {new Date(user.approved_at).toLocaleDateString("en-US")}</span>
            </div>
          )}
          {user.expiration_date && (
            <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
              <Clock className="w-3 h-3 lg:w-4 lg:w-4 flex-shrink-0" />
              <span className="truncate">Expires: {new Date(user.expiration_date).toLocaleDateString("en-US")}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
            <Activity className="w-3 h-3 lg:w-4 lg:w-4 flex-shrink-0" />
            <span className="truncate">Updated: {new Date(user.updated_at).toLocaleDateString("en-US")}</span>
          </div>
          <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
            <Monitor className="w-3 h-3 lg:w-4 lg:w-4 flex-shrink-0" />
            <span className="truncate">Active Sessions: {user.active_sessions_count || 0}</span>
          </div>
          <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
            <Smartphone className="w-3 h-3 lg:w-4 lg:w-4 flex-shrink-0" />
            <span className="truncate">Active Devices: {user.active_devices_count || 0}</span>
          </div>
          <div className="flex items-center gap-2 text-xs lg:text-sm">
            <div className={`w-2 h-2 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-500"}`}></div>
            <span className={user.is_active ? "text-green-600" : "text-red-600"}>
              {user.is_active ? "Account Active" : "Account Deactivated"}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {/* Primary Actions Row */}
          <div className="flex items-center gap-2">
            {user.current_status === "pending" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApproveUser(user)}
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 flex-1 text-xs font-medium"
                >
                  <CheckCircle className="h-3 w-3 mr-1.5" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRejectUser(user.id)}
                  className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 flex-1 text-xs font-medium"
                >
                  <XCircle className="h-3 w-3 mr-1.5" />
                  Reject
                </Button>
              </>
            )}

            {/* Activation Toggle - Most Important Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("[v0] Toggle button clicked for user:", user.id, "current is_active:", user.is_active)
                onToggleStatus(user.id, user.is_active)
              }}
              className={`flex-1 text-xs font-medium transition-all duration-200 ${
                user.is_active
                  ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
                  : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
              }`}
            >
              {user.is_active ? (
                <>
                  <UserX className="h-3 w-3 mr-1.5" />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="h-3 w-3 mr-1.5" />
                  Activate
                </>
              )}
            </Button>
          </div>

          {/* Secondary Actions Row */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewUser(user)}
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 flex-1 text-xs font-medium"
            >
              <Eye className="h-3 w-3 mr-1.5" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewSessions(user)}
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 flex-1 text-xs font-medium"
              disabled={!user.active_sessions_count || user.active_sessions_count === 0}
            >
              <Monitor className="h-3 w-3 mr-1.5" />
              Sessions ({user.active_sessions_count || 0})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteUser(user.id)}
              className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 p-2"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    )
  },
)

UserCard.displayName = "UserCard"
