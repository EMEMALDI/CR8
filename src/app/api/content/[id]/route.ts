import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { userId } = await auth()

    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        creator: {
          include: {
            user: {
              select: {
                username: true,
                displayName: true,
                avatar: true,
              },
            },
          },
        },
        files: true,
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            comments: true,
            favorites: true,
            reviews: true,
          },
        },
      },
    })

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Check if user has access
    let hasAccess = false
    let purchased = false
    let subscribed = false

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
      })

      if (user) {
        // Check if user is creator
        if (content.creatorId === user.creatorProfile?.id) {
          hasAccess = true
        }

        // Check if purchased
        const purchase = await prisma.purchase.findFirst({
          where: {
            userId: user.id,
            contentId: content.id,
          },
        })

        if (purchase) {
          hasAccess = true
          purchased = true
        }

        // Check if subscribed
        if (
          content.accessModel === 'SUBSCRIPTION' ||
          content.accessModel === 'HYBRID'
        ) {
          const subscription = await prisma.subscription.findFirst({
            where: {
              userId: user.id,
              tier: {
                creatorId: content.creatorId,
              },
              status: 'ACTIVE',
              endDate: {
                gte: new Date(),
              },
            },
          })

          if (subscription) {
            hasAccess = true
            subscribed = true
          }
        }

        // Free content
        if (content.accessModel === 'FREE') {
          hasAccess = true
        }
      }
    }

    // Increment view count
    await prisma.content.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...content,
        hasAccess,
        purchased,
        subscribed,
      },
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
        { error: 'Creator profile required' },
        { status: 403 }
      )
    }

    const content = await prisma.content.findUnique({
      where: { id },
    })

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    if (content.creatorId !== user.creatorProfile.id) {
      return NextResponse.json(
        { error: 'You do not own this content' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      title,
      description,
      price,
      accessModel,
      commentsEnabled,
      allowDownload,
      watermarkEnabled,
    } = body

    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        title,
        description,
        price: price ? parseFloat(price) : undefined,
        accessModel,
        commentsEnabled,
        allowDownload,
        watermarkEnabled,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedContent,
    })
  } catch (error) {
    console.error('Error updating content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
        { error: 'Creator profile required' },
        { status: 403 }
      )
    }

    const content = await prisma.content.findUnique({
      where: { id },
    })

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    if (content.creatorId !== user.creatorProfile.id) {
      return NextResponse.json(
        { error: 'You do not own this content' },
        { status: 403 }
      )
    }

    // Soft delete
    await prisma.content.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    })

    return NextResponse.json({
      success: true,
      message: 'Content archived successfully',
    })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
