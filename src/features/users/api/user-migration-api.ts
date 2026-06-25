import { apiClient } from '@/lib/api/api-client'
import type { UserMigrationResponse } from '../types/user-migration.types'

const MIGRATION_TIMEOUT_MS = 120_000

export const userMigrationApi = {
  migrateAllWithPasswords: () =>
    apiClient.post<UserMigrationResponse>(
      '/api/user-migration/migrate-all-with-passwords',
      undefined,
      { timeout: MIGRATION_TIMEOUT_MS },
    ),
}
