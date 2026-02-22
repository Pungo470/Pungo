import { motion } from 'framer-motion'

export function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative size-12">
        <motion.div
          className="absolute inset-0 rounded-full bg-primary"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-2xl">spa</span>
        </div>
      </div>
    </div>
  )
}

export function PulseLoader() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <LoadingIndicator />
      <p className="text-primary font-bold animate-pulse">Lade Pungo...</p>
    </div>
  )
}
