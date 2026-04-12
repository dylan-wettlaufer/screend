import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/layout/AppSidebar'

export default async function ProtectedAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  return (
    <div className="min-h-screen bg-bg-base flex">
      <AppSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
