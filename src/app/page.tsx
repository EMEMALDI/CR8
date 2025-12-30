import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Music, Video, FileText, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Sell Your Digital Content,
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {' '}Your Way
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            The complete platform for creators to monetize music, videos, courses, and more.
            No limits, no barriers.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Start Creating
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline">
                Explore Content
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            All Your Content, One Platform
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-3 rounded-lg border bg-card p-6">
              <Music className="h-10 w-10 text-purple-600" />
              <h3 className="text-xl font-semibold">Music & Audio</h3>
              <p className="text-muted-foreground">
                Sell tracks, albums, or stream with subscriptions. Built-in player with playlists.
              </p>
            </div>
            <div className="space-y-3 rounded-lg border bg-card p-6">
              <Video className="h-10 w-10 text-blue-600" />
              <h3 className="text-xl font-semibold">Videos & Courses</h3>
              <p className="text-muted-foreground">
                Secure streaming with HLS. Perfect for tutorials, films, and educational content.
              </p>
            </div>
            <div className="space-y-3 rounded-lg border bg-card p-6">
              <FileText className="h-10 w-10 text-green-600" />
              <h3 className="text-xl font-semibold">Documents & More</h3>
              <p className="text-muted-foreground">
                PDFs, ebooks, templates, photos. Any digital product you create.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Models */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Flexible Monetization
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-6">
              <h3 className="mb-2 font-semibold">Single Purchase</h3>
              <p className="text-sm text-muted-foreground">
                One-time payment, lifetime access
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="mb-2 font-semibold">Subscriptions</h3>
              <p className="text-sm text-muted-foreground">
                Monthly recurring revenue from fans
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="mb-2 font-semibold">Free + Premium</h3>
              <p className="text-sm text-muted-foreground">
                Hybrid model for maximum reach
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="mb-2 font-semibold">Custom Requests</h3>
              <p className="text-sm text-muted-foreground">
                Get paid for commissioned work
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Monetize Your Creativity?
          </h2>
          <p className="mb-8 text-lg opacity-90">
            Join thousands of creators earning from their digital content
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="secondary">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 CR8. Built for creators, by creators.</p>
        </div>
      </footer>
    </div>
  )
}
