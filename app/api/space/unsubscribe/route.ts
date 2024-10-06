// import { getAuthSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();

    // Check if spaceId is provided in the request body
    const { spaceId } = body;
    if (!spaceId) {
      return new Response('Missing spaceId', { status: 400 });
    }

    // Check if the user has already subscribed
    const subscriptionExists = await prisma.subscription.findFirst({
      where: {
        spaceId,
        userId: session.user.id,
      },
    });

    if (!subscriptionExists) {
        return NextResponse.json(
            { success: false, message: "You've not subscribed to space yet" },
            { status: 400 }
          );
    }

    // Delete the subscription
    await prisma.subscription.delete({
      where: {
        userId_spaceId: {
          userId: session.user.id,
          spaceId,
        },
      },
    });

    return NextResponse.json(
        { success: true, message: "Unsubscribed successfully" },
        { status: 200 }
    );  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: `Error unsubscribing from space: ${error.message}` },
      { status: 500 }
    );
  }
}
