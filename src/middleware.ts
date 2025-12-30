import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/explore(.*)',
  '/search(.*)',
  '/c/:username(.*)',
  '/content/:id(.*)',
  '/api/webhooks(.*)',
])

// Define creator-only routes
const isCreatorRoute = createRouteMatcher([
  '/creator(.*)',
])

// Define admin-only routes
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Get auth information
  const { userId, sessionClaims } = await auth()

  // Allow public routes
  if (isPublicRoute(req)) {
    return
  }

  // Protect all other routes - require authentication
  if (!userId) {
    return await auth.protect()
  }

  // Check creator-only routes
  if (isCreatorRoute(req)) {
    const userRole = sessionClaims?.metadata?.role as string | undefined

    if (userRole !== 'CREATOR' && userRole !== 'ADMIN') {
      return Response.redirect(new URL('/dashboard', req.url))
    }
  }

  // Check admin-only routes
  if (isAdminRoute(req)) {
    const userRole = sessionClaims?.metadata?.role as string | undefined

    if (userRole !== 'ADMIN') {
      return Response.redirect(new URL('/dashboard', req.url))
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
