export interface UserPlainPasswordExport {
  id: number
  userName: string
  fullName: string
  plainPassword: string
}

export interface UserMigrationResponse {
  message: string
  totalLegacyUsers: number
  createdCount: number
  updatedCount: number
  appOnlyPasswordResetCount: number
  plainPasswords: UserPlainPasswordExport[]
}
