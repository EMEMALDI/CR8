import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { displayName, bio } = body

    // Check if user already has creator profile
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { creatorProfile: true },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (existingUser.creatorProfile) {
      return NextResponse.json(
        { error: 'User is already a creator' },
        { status: 409 }
      )
    }

    // Create Stripe Connect account
    const stripeAccount = await stripe.accounts.create({
      type: 'express',
      email: existingUser.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    })

    // Create creator profile
    const creatorProfile = await prisma.creatorProfile.create({
      data: {
        userId: existingUser.id,
        displayName: displayName || existingUser.displayName || existingUser.username,
        bio: bio || null,
        avatar: existingUser.avatar,
        stripeAccountId: stripeAccount.id,
        verified: false,
      },
    })

    // Update user role in database
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { role: 'CREATOR' },
    })

    // Update user role in Clerk
    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'CREATOR',
      },
    })

    // Create account link for Stripe onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/creator/settings`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/creator/dashboard`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      success: true,
      data: {
        creatorProfile,
        onboardingUrl: accountLink.url,
      },
    })
  } catch (error) {
    console.error('Error upgrading to creator:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
