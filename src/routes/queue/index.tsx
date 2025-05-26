import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/queue/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/queue/index/$eventID"!</div>
}
