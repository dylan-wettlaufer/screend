interface ScanResultPageProps {
  params: Promise<{ id: string }>
}

export default async function ScanResultPage({ params }: ScanResultPageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center px-4">
      <div className="rounded-card border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 max-w-md w-full">
        <p className="text-xs font-mono text-[var(--color-text-tertiary)] mb-1">scan id</p>
        <p className="font-mono text-sm text-[var(--color-accent)] break-all">{id}</p>
      </div>
    </div>
  )
}
