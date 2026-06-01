import { createFileRoute } from '@tanstack/react-router'
import UserDetail from '../features/users/components/UserDetail'

export const Route = createFileRoute('/users/$userId')({
  component: UserDetailPage,
})

function UserDetailPage() {
  const { userId } = Route.useParams()

  return <UserDetail userId={Number(userId)} />
}
