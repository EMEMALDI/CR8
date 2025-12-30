import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        creatorProfile: {
          include: {
            subscriptionTiers: true,
            _count: {
              select: {
                content: true,
                payouts: true,
              },
            },
          },
        },
      },
    })

    if (!user?.creatorProfile) {
      return NextResponse.json(
        { error: 'Creator profile not found' },
        { status: 404 }
      )
    }

    // Calculate earnings
    const purchases = await prisma.purchase.aggregate({
      where: {
        content: {
          creatorId: user.creatorProfile.id,
        },
      },
      _sum: {
        creatorEarning: true,
      },
    })

    const payouts = await prisma.payout.aggregate({
      where: {
        creatorId: user.creatorProfile.id,
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
    })

    const totalEarned = purchases._sum.creatorEarning || 0
    const totalPaidOut = payouts._sum.amount || 0
    const availableBalance = Number(totalEarned) - Number(totalPaidOut)

    return NextResponse.json({
      success: true,
      data: {
        ...user.creatorProfile,
        stats: {
          totalEarned,
          availableBalance,
          totalPaidOut,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching creator profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { creatorProfile: true },
    })

    if (!user?.creatorProfile) {
      return NextResponse.json(
        { error: 'Creator profile not found' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const {
      displayName,
      bio,
      avatar,
      coverImage,
      socialLinks,
      allowMessages,
      messagePricePerMessage,
      allowCustomRequests,
    } = body

    const updatedProfile = await prisma.creatorProfile.update({
      where: { id: user.creatorProfile.id },
      data: {
        displayName,
        bio,
        avatar,
        coverImage,
        socialLinks,
        allowMessages,
        messagePricePerMessage,
        allowCustomRequests,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedProfile,
    })
  } catch (error) {
    console.error('Error updating creator profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
