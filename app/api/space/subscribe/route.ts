
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/db';
// import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server';
// import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const spaceId = body.spaceId; 

    // check if user has already subscribed to subreddit
    const subscriptionExists = await prisma.subscription.findFirst({
      where: {
        spaceId,
        userId: session.user.id,
      },
    })

    if (subscriptionExists) {
      return new Response("You've already subscribed to this subreddit", {
        status: 400,
      })
    }

    // create subscription and associate it with the user
    await prisma.subscription.create({
      data: {
        spaceId,
        userId: session.user.id,
      },
    })

    return NextResponse.json(
        { success: true, message: "Spaces retrieved successfully", spaceId },
        { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
        { success: false, message: `Error deleting space: ${error.message}` },
        { status: 500 }
      );
  }
}