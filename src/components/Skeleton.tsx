import { motion } from 'framer-motion'

export function Skeleton({ className, rounded = 'lg' }: { className?: string, rounded?: string }) {
  return (
    <div className={`bg-gray-200 overflow-hidden relative ${className} rounded-${rounded}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        }}
      />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Skeleton className="lg:col-span-1 h-[400px] rounded-3xl" />
      <div className="lg:col-span-2 flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
        <Skeleton className="h-48 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

export function BenchmarkSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-6 border border-primary/5">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
