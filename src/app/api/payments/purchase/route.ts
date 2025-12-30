import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const { contentId, affiliateCode } = body

    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        creator: true,
      },
    })

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    if (content.accessModel !== 'PURCHASE' && content.accessModel !== 'HYBRID') {
      return NextResponse.json(
        { error: 'Content is not available for purchase' },
        { status: 400 }
      )
    }

    if (!content.price) {
      return NextResponse.json(
        { error: 'Content does not have a price' },
        { status: 400 }
      )
    }

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        contentId: content.id,
      },
    })

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Content already purchased' },
        { status: 409 }
      )
    }

    // Check affiliate code
    let affiliateLink = null
    if (affiliateCode) {
      affiliateLink = await prisma.affiliateLink.findUnique({
        where: { code: affiliateCode, active: true },
      })
    }

    // Calculate amounts
    const amount = Number(content.price)
    const platformFeeRate = Number(content.creator.commissionRate)
    const platformFee = amount * platformFeeRate
    let creatorEarning = amount - platformFee
    let affiliateCommission = 0

    if (affiliateLink) {
      affiliateCommission = amount * Number(affiliateLink.commissionRate)
      creatorEarning -= affiliateCommission
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: user.id,
        contentId: content.id,
        affiliateLinkId: affiliateLink?.id || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        amount,
        contentId: content.id,
      },
    })
  } catch (error) {
    console.error('Error creating purchase:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
