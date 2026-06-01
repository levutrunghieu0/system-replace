import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/front')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/front"!</div>
}
