import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-8 pb-24 bg-background">
        <div className="max-w-3xl text-center space-y-6">
          <h1 className="text-5xl font-black text-primary-dark tracking-tight">
            Investiere in dein zukünftiges Ich
          </h1>
          <p className="text-xl text-text-muted leading-relaxed">
            Wähle den Plan, der zu deiner finanziellen Reise passt. Einfache, transparente Preise ohne versteckte Gebühren.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link 
              href="/dashboard" 
              className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all"
            >
              Zum Dashboard
            </Link>
            <Link 
              href="/pricing" 
              className="bg-white border-2 border-primary/20 hover:border-primary text-primary-dark font-bold py-3 px-8 rounded-xl transition-all"
            >
              Preise ansehen
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
