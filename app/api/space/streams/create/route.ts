import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-expect-error
import youtubesearchapi from "youtube-search-api";
import { YT_REGEX } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";

const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
  spaceId:z.string()
});

const MAX_QUEUE_LEN = 20;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user.id) {
      return NextResponse.json(
        {
          message: "Unauthenticated",
        },
        {
          status: 403,
        },
      );
    }
    const user = session.user;

    const data = CreateStreamSchema.parse(await req.json());

    if (!data.url.trim()) {
      return NextResponse.json(
        {
          message: "YouTube link cannot be empty",
        },
        {
          status: 400,
        },
      );
    }

    const isYt = data.url.match(YT_REGEX);
    const videoId = data.url ? data.url.match(YT_REGEX)?.[1] : null;
    if (!isYt || !videoId) {
      return NextResponse.json(
        {
          message: "Invalid YouTube URL format",
        },
        {
          status: 400,
        },
      );
    }

    const res = await youtubesearchapi.GetVideoDetails(videoId);
    // console.log("Youtube response api",res); 

    // Check if the user is not the creator
    if (user.id !== data.creatorId) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

      const userRecentStreams = await prisma.stream.count({
        where: {
          userId: data.creatorId,
          addedBy: user.id,
          createAt: {
            gte: tenMinutesAgo,
          },
        },
      });

      // Check for duplicate song in the last 10 minutes
      const duplicateSong = await prisma.stream.findFirst({
        where: {
          userId: data.creatorId,
          extractedId: videoId,
          createAt: {
            gte: tenMinutesAgo,
          },
        },
      });
      if (duplicateSong) {
        return NextResponse.json(
          {
            message: "This song was already added in the last 10 minutes",
          },
          {
            status: 429,
          },
        );
      }

      // Rate limiting checks for non-creator users
      const streamsLastTwoMinutes = await prisma.stream.count({
        where: {
          userId: data.creatorId,
          addedBy: user.id,
          createAt: {
            gte: twoMinutesAgo,
          },
        },
      });

      if (streamsLastTwoMinutes >= 2) {
        return NextResponse.json(
          {
            message:
              "Rate limit exceeded: You can only add 2 songs per 2 minutes",
          },
          {
            status: 429,
          },
        );
      }

      if (userRecentStreams >= 5) {
        return NextResponse.json(
          {
            message:
              "Rate limit exceeded: You can only add 5 songs per 10 minutes",
          },
          {
            status: 429,
          },
        );
      }
    }

    const thumbnails = res.thumbnail?.thumbnails;
    thumbnails.sort((a: { width: number }, b: { width: number }) =>
      a.width < b.width ? -1 : 1,
    );

    const existingActiveStreams = await prisma.stream.count({
      where: {
        spaceId: data.spaceId,
        played: false,
      },
    });

    if (existingActiveStreams >= MAX_QUEUE_LEN) {
      return NextResponse.json(
        {
          message: "Queue is full",
        },
        {
          status: 429,
        },
      );
    }

    const stream = await prisma.stream.create({
      data: {
        userId: data.creatorId,
        addedBy: user.id,
        url: data.url,
        extractedId: videoId,
        type: "Youtube",
        title: res.title ?? "Can't find video",
        smallImg:
          (thumbnails.length > 1
            ? thumbnails[thumbnails.length - 2].url
            : thumbnails[thumbnails.length - 1].url) ??
          "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg",
        bigImg:
          thumbnails[thumbnails.length - 1].url ??
          "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg",
        spaceId:data.spaceId
      },
    });
    // console.log(stream); 

    return NextResponse.json({
      ...stream,
      hasUpvoted: false,
      upvotes: 0,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        message: "Error while adding a stream",
      },
      {
        status: 500,
      },
    );
  }
}


// Get streams in that particular space: 
export async function GET(req: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
  
      if (!session?.user.id) {
        return NextResponse.json(
          { message: 'Unauthenticated' },
          { status: 403 }
        );
      }
  
      const spaceId = req.nextUrl.searchParams.get("spaceId");
  
      if (!spaceId) {
        return NextResponse.json(
          { message: 'Space ID is required' },
          { status: 400 }
        );
      }
  
      // Fetch all streams from the database for the given spaceId
      const streams = await prisma.stream.findMany({
        where: {
          spaceId: spaceId,
        },
        orderBy: {
          createAt: 'asc', 
        },
      });
  
      return NextResponse.json(streams);
    } catch (error) {
      console.error('Error fetching streams:', error);
      return NextResponse.json(
        { message: 'Error fetching streams' },
        { status: 500 }
      );
    }
  }