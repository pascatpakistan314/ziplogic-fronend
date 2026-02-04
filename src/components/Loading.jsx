import { Loader2 } from 'lucide-react'

export default function Loading({ text = 'Loading...', size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizes[size]} text-primary-500 animate-spin`} />
      {text && <p className="text-dark-400">{text}</p>}
    </div>
  )
}

export function FullPageLoading({ text }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading text={text} size="lg" />
    </div>
  )
}

export function ButtonLoading() {
  return <Loader2 className="w-4 h-4 animate-spin" />
}
