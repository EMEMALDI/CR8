import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object)
        break

      case 'transfer.paid':
        await handleTransferPaid(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { userId, contentId, affiliateLinkId } = paymentIntent.metadata

  if (!userId || !contentId) {
    console.error('Missing metadata in payment intent')
    return
  }

  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: { creator: true },
  })

  if (!content) {
    console.error('Content not found:', contentId)
    return
  }

  const amount = paymentIntent.amount / 100
  const platformFeeRate = Number(content.creator.commissionRate)
  const platformFee = amount * platformFeeRate
  let creatorEarning = amount - platformFee
  let affiliateCommission = 0

  if (affiliateLinkId) {
    const affiliateLink = await prisma.affiliateLink.findUnique({
      where: { id: affiliateLinkId },
    })

    if (affiliateLink) {
      affiliateCommission = amount * Number(affiliateLink.commissionRate)
      creatorEarning -= affiliateCommission

      // Update affiliate stats
      await prisma.affiliateLink.update({
        where: { id: affiliateLinkId },
        data: {
          conversionCount: { increment: 1 },
          totalEarned: { increment: affiliateCommission },
        },
      })
    }
  }

  // Create purchase record
  await prisma.purchase.create({
    data: {
      userId,
      contentId,
      affiliateLinkId: affiliateLinkId || null,
      amount,
      platformFee,
      creatorEarning,
      affiliateCommission,
      stripePaymentId: paymentIntent.id,
    },
  })

  // Update content stats
  await prisma.content.update({
    where: { id: contentId },
    data: { purchaseCount: { increment: 1 } },
  })

  // Create notification for creator
  await prisma.notification.create({
    data: {
      userId: content.creator.userId,
      type: 'PURCHASE',
      title: 'New purchase!',
      message: `Your content "${content.title}" was purchased`,
      linkUrl: `/creator/content/${contentId}`,
    },
  })
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const { userId, tierId } = subscription.metadata

  if (!userId || !tierId) {
    console.error('Missing metadata in subscription')
    return
  }

  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      stripeSubscriptionId: subscription.id,
    },
  })

  const startDate = new Date(subscription.current_period_start * 1000)
  const endDate = new Date(subscription.current_period_end * 1000)

  if (existingSubscription) {
    // Update existing
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        status: subscription.status === 'active' ? 'ACTIVE' : 'PAUSED',
        startDate,
        endDate,
        canceledAt: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
        autoRenew: !subscription.cancel_at_period_end,
      },
    })
  } else {
    // Create new
    await prisma.subscription.create({
      data: {
        userId,
        tierId,
        status: subscription.status === 'active' ? 'ACTIVE' : 'PAUSED',
        startDate,
        endDate,
        stripeSubscriptionId: subscription.id,
        autoRenew: !subscription.cancel_at_period_end,
      },
    })

    // Increment subscriber count
    await prisma.subscriptionTier.update({
      where: { id: tierId },
      data: { subscriberCount: { increment: 1 } },
    })
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      stripeSubscriptionId: subscription.id,
    },
  })

  if (existingSubscription) {
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        status: 'EXPIRED',
        canceledAt: new Date(),
      },
    })

    // Decrement subscriber count
    await prisma.subscriptionTier.update({
      where: { id: existingSubscription.tierId },
      data: { subscriberCount: { decrement: 1 } },
    })
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string

  if (!subscriptionId) return

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  })

  if (subscription) {
    // Extend subscription
    const endDate = new Date(subscription.endDate)
    endDate.setDate(endDate.getDate() + 30)

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { endDate, status: 'ACTIVE' },
    })
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string

  if (!subscriptionId) return

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
    include: { user: true },
  })

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'PAUSED' },
    })

    // Notify user
    await prisma.notification.create({
      data: {
        userId: subscription.userId,
        type: 'PAYMENT',
        title: 'Payment failed',
        message: 'Your subscription payment failed. Please update your payment method.',
        linkUrl: '/subscriptions',
      },
    })
  }
}

async function handleTransferPaid(transfer: Stripe.Transfer) {
  const { payoutId } = transfer.metadata

  if (!payoutId) return

  await prisma.payout.update({
    where: { id: payoutId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  })
}
