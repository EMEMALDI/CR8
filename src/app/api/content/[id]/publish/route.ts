import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

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
      include: { files: true },
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

    if (content.files.length === 0) {
      return NextResponse.json(
        { error: 'Content must have at least one file' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { scheduledFor } = body

    const updateData: any = {
      status: scheduledFor ? 'SCHEDULED' : 'PUBLISHED',
    }

    if (scheduledFor) {
      updateData.scheduledFor = new Date(scheduledFor)
    } else {
      updateData.publishedAt = new Date()
    }

    const updatedContent = await prisma.content.update({
      where: { id },
      data: updateData,
    })

    // Send notifications to subscribers
    if (!scheduledFor) {
      const subscriptions = await prisma.subscription.findMany({
        where: {
          tier: {
            creatorId: user.creatorProfile.id,
          },
          status: 'ACTIVE',
        },
        include: { user: true },
      })

      // Create notifications
      for (const subscription of subscriptions) {
        await prisma.notification.create({
          data: {
            userId: subscription.user.id,
            type: 'NEW_CONTENT',
            title: 'New content from ' + user.creatorProfile.displayName,
            message: content.title,
            linkUrl: `/content/${content.id}`,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedContent,
    })
  } catch (error) {
    console.error('Error publishing content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
