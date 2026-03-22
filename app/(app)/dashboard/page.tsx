import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'


export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) redirect('/sign-in')

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
      <div className="bg-[#111113] border border-[#27272a] rounded-xl p-8 max-w-md w-full">
        <h1 className="text-[#fafafa] text-xl font-medium mb-2">
          Welcome to Screend
        </h1>
        <p className="text-[#a1a1aa] text-sm">
          Signed in as {user.emailAddresses[0].emailAddress}
        </p>
      </div>
    </div>
  )
}