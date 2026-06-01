import { httpClient } from '../../../services/httpClient'
import type { User } from '../types/user'

export const usersApi = {
  getUsers: (): Promise<User[]> => httpClient.get<User[]>('/users'),
  getUserById: (id: number): Promise<User> => httpClient.get<User>(`/users/${id}`),
}
