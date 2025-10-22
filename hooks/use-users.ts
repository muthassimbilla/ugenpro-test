import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AdminUserService, type AdminUser } from "@/lib/admin-user-service"

// Query keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  paginated: (page: number, pageSize: number, searchTerm: string, statusFilter: string) =>
    [...userKeys.lists(), { page, pageSize, searchTerm, statusFilter }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

export function useUsersPaginated(
  page = 1,
  pageSize = 50,
  searchTerm = "",
  statusFilter: "all" | "active" | "suspended" | "expired" | "pending" = "all",
) {
  return useQuery({
    queryKey: userKeys.paginated(page, pageSize, searchTerm, statusFilter),
    queryFn: () => AdminUserService.getAllUsers(page, pageSize, searchTerm, statusFilter),
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 60000, // Keep in cache for 1 minute
  })
}

// Legacy hook for backward compatibility
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: async () => {
      const result = await AdminUserService.getAllUsers(1, 1000)
      return result.users
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: string; userData: Partial<AdminUser> }) =>
      AdminUserService.updateUser(data.id, data.userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => AdminUserService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { userId: string; isActive: boolean }) =>
      AdminUserService.toggleUserStatus(data.userId, data.isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useApproveUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { userId: string; expirationDate: string }) =>
      AdminUserService.approveUser(data.userId, undefined, data.expirationDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useRejectUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => AdminUserService.rejectUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: {
      full_name: string
      email: string
      is_active: boolean
      account_status: "active" | "suspended"
      expiration_date?: string | null
    }) => AdminUserService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useUpdateUserSecurity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      userId: string
      securityData: {
        status?: "active" | "suspended"
        expirationDate?: string | null
        activateAccount?: boolean
      }
    }) => AdminUserService.handleSecurityUpdate(data.userId, data.securityData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
