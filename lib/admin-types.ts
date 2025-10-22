export interface Admin {
  id: string
  username: string
  full_name: string
  created_at: string
  updated_at: string
}

export interface AdminLoginCredentials {
  username: string
  password: string
}
