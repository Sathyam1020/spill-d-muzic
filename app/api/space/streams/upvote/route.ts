import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Upvote schema for validation
const UpvoteSchema = z.object({
  streamId: z.string(),
});

// POST (for upvoting)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      {
        status: 403,
      }
    );
  }

  const user = session.user;

  try {
    const data = UpvoteSchema.parse(await req.json());

    // Create upvote
    await prisma.upvote.create({
      data: {
        userId: user.id,
        streamId: data.streamId,
      },
    });

    return NextResponse.json({
      message: "Upvoted successfully!",
    });
  } catch (e: any) {
    if (e.code === "P2002") {
      // Prisma unique constraint violation error (duplicate upvote)
      return NextResponse.json(
        {
          message: "You have already upvoted this stream.",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Error while upvoting.",
      },
      {
        status: 500,
      }
    );
  }
}

// GET (for getting the upvote count)
export async function GET(req: NextRequest) {
  // Use query parameters instead of JSON body for GET requests
  const { searchParams } = new URL(req.url);
  const streamId = searchParams.get("streamId");

  if (!streamId) {
    return NextResponse.json(
      {
        message: "streamId is required",
      },
      {
        status: 400,
      }
    );
  }

  try {
    // Count upvotes for the given streamId
    const count = await prisma.upvote.count({
      where: {
        streamId: String(streamId),
      },
    });

    return NextResponse.json({
      count,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: `Error fetching upvotes: ${error.message}`,
      },
      {
        status: 500,
      }
    );
  }
}
