import { useQuery } from '@tanstack/react-query'
import { usersApi } from './usersApi'
import type { User } from '../types/user'

export const usersQueryKeys = {
  all: ['users'] as const,
  lists: () => [...usersQueryKeys.all, 'list'] as const,
  detail: (id: number) => [...usersQueryKeys.all, 'detail', id] as const,
}

export function useUsersQuery() {
  return useQuery<User[], Error>({
    queryKey: usersQueryKeys.lists(),
    queryFn: () => usersApi.getUsers(),
  })
}
