// Notification service for creating notifications programmatically

export interface CreateNotificationParams {
  userId: string
  title: string
  message: string
  type?: "info" | "success" | "warning" | "error"
  link?: string
}

export class NotificationService {
  // Create a notification for a user
  static async createNotification(params: CreateNotificationParams): Promise<void> {
    try {
      const response = await fetch("/api/admin/create-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        throw new Error("Failed to create notification")
      }
    } catch (error) {
      console.error("[v0] Failed to create notification:", error)
      throw error
    }
  }

  // Create notification for multiple users
  static async createBulkNotifications(
    userIds: string[],
    title: string,
    message: string,
    type: "info" | "success" | "warning" | "error" = "info",
    link?: string,
  ): Promise<void> {
    try {
      const promises = userIds.map((userId) =>
        this.createNotification({
          userId,
          title,
          message,
          type,
          link,
        }),
      )

      await Promise.all(promises)
    } catch (error) {
      console.error("[v0] Failed to create bulk notifications:", error)
      throw error
    }
  }
}
