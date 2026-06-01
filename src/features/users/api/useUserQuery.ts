import { useQuery } from '@tanstack/react-query'
import { usersApi } from './usersApi'
import { usersQueryKeys } from './useUsersQuery'
import type { User } from '../types/user'

export function useUserQuery(id: number) {
  return useQuery<User, Error>({
    queryKey: usersQueryKeys.detail(id),
    queryFn: () => usersApi.getUserById(id),
    enabled: id > 0,
  })
}
