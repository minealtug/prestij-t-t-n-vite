import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import { userMigrationApi } from '../api/user-migration-api'
import { downloadPlainPasswordsCsv } from '../utils/export-plain-passwords'

export const USER_MIGRATION_DONE_KEY = 'prestij-user-migration-done'

export function useMigrateUsers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => userMigrationApi.migrateAllWithPasswords(),
    onSuccess: (data) => {
      if (data.plainPasswords.length > 0) {
        downloadPlainPasswordsCsv(data.plainPasswords)
      }
      localStorage.setItem(USER_MIGRATION_DONE_KEY, '1')
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
    },
  })
}
