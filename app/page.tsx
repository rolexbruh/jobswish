import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Users, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">Applyly</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-3xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm">
            <Sparkles className="h-4 w-4" />
            AI-Powered Internship Matching
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-balance">
            Find Your Perfect Internship Match with a Swipe
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto text-pretty">
            Applyly uses AI to match students with internship opportunities. Swipe right on internships you love, and let recruiters find you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Start Swiping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signup">I&apos;m a Company</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl w-full">
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="p-2 bg-primary/10 rounded-lg w-fit mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Swipe to Apply</h3>
            <p className="text-sm text-muted-foreground">
              Browse internships effortlessly. Swipe right to apply, left to skip. It&apos;s that simple.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="p-2 bg-primary/10 rounded-lg w-fit mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">AI Matching</h3>
            <p className="text-sm text-muted-foreground">
              Our AI analyzes your skills and education to show you the most relevant internship opportunities.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="p-2 bg-primary/10 rounded-lg w-fit mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Direct Connection</h3>
            <p className="text-sm text-muted-foreground">
              Companies see your profile and can reach out directly. No middleman.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Applyly. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
