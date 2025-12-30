import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
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
        { error: 'Creator profile required' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      contentType,
      title,
      description,
      accessModel,
      price,
      tags,
      commentsEnabled,
      allowDownload,
      watermarkEnabled,
    } = body

    // Validation
    if (!title || title.length < 3) {
      return NextResponse.json(
        { error: 'Title must be at least 3 characters' },
        { status: 400 }
      )
    }

    if ((accessModel === 'PURCHASE' || accessModel === 'HYBRID') && !price) {
      return NextResponse.json(
        { error: 'Price is required for paid content' },
        { status: 400 }
      )
    }

    // Create content
    const content = await prisma.content.create({
      data: {
        creatorId: user.creatorProfile.id,
        contentType,
        title,
        description,
        accessModel,
        price: price ? parseFloat(price) : null,
        status: 'DRAFT',
        commentsEnabled: commentsEnabled ?? true,
        allowDownload: allowDownload ?? false,
        watermarkEnabled: watermarkEnabled ?? false,
      },
    })

    // Handle tags
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        // Find or create tag
        let tag = await prisma.tag.findFirst({
          where: { name: tagName },
        })

        if (!tag) {
          const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          tag = await prisma.tag.create({
            data: {
              name: tagName,
              slug,
              category: 'TOPIC',
            },
          })
        }

        // Link tag to content
        await prisma.contentTag.create({
          data: {
            contentId: content.id,
            tagId: tag.id,
          },
        })

        // Increment usage count
        await prisma.tag.update({
          where: { id: tag.id },
          data: { usageCount: { increment: 1 } },
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: content,
    })
  } catch (error) {
    console.error('Error creating content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
