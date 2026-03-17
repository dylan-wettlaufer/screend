import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0b]">
      <div className="mb-8 flex items-center gap-2">
        <div className="w-7 h-7 bg-[#3b82f6] rounded-md flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="1" width="10" height="10" rx="2" stroke="#fff" strokeWidth="1.5"/>
            <path d="M3 6h6M3 4h4M3 8h3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="text-[#fafafa] font-medium text-lg">Screend</span>
      </div>
      <SignIn />
    </div>
  )
}