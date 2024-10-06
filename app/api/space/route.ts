import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";
import { NextApiRequest } from "next";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


// Create a space: 
export async function POST(req: NextRequest){
    try {
        // Get the current user's session: 
        const session = await getServerSession(authOptions); 

        // Check if the user is authenticated: 
        if (!session?.user?.id) {
            return NextResponse.json(
              { success: false, message: "You must be logged in to create a space" },
              { status: 401 }
            );
        }

        // Parse the data: 
        const { spaceName, password, isPublic, isActive } = await req.json(); 

        if (isPublic === false && !password) {
            return NextResponse.json(
              { success: false, message: "Password is required for private spaces" },
              { status: 400 }
            );
        }

        if(!isActive) {
            return NextResponse.json({
                success: false,
                message: "Select if the space is active or not"
            })
        }

        // Validate the user input 
        if (!spaceName || typeof spaceName !== "string" || spaceName.trim() === "") {
            return NextResponse.json(
              { success: false, message: "Space name is required and must be a non-empty string" },
              { status: 400 }
            );
        }

        // Create the space in the database: 
        const space = await prisma.space.create({
            data: {
              name: spaceName,
              hostId: session.user.id,
              isPublic: isPublic,
              password: isPublic ? null : password,
              isActive: isActive 
            },
        });

        // Return response: 
        return NextResponse.json(
            { success: true, message: "Space created successfully", space },
            { status: 201 }
        );

    } catch (error: any) {
        if (error.message === "Unauthenticated Request") {
            return NextResponse.json(
              { success: false, message: "You must be logged in to create a space" },
              { status: 401 }
            );
          }
      
          
          return NextResponse.json(
            { success: false, message: `An unexpected error occurred: ${error.message}` },
            { status: 500 }
          );
    }
}

// Get spaces
export async function GET(req:NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
              { success: false, message: "You must be logged in to retrieve space information" },
              { status: 401 }
            );
          }
          const spaceId = req.nextUrl.searchParams.get("spaceId");

            // If spaceId exist return the hostId
          if (spaceId) {
            const space = await prisma.space.findUnique({
              where: { id: spaceId },
              select: { hostId: true },
            });
      
            if (!space) {
              return NextResponse.json(
                { success: false, message: "Space not found" },
                { status: 404 }
              );
            }
      
            return NextResponse.json(
              { success: true, message: "Host ID retrieved successfully", hostId: space.hostId },
              { status: 200 }
            );
          }
      
          // If no spaceId is provided, retrieve all spaces
        const spaces=await prisma.space.findMany({
            include: {
                streams: true,
                currentStream: true,
                host: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                members: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
            },
        })
        return NextResponse.json(
            { success: true, message: "Spaces retrieved successfully", spaces },
            { status: 200 })
      
    } catch (error:any) {
        console.error("Error retrieving space:", error);
    return NextResponse.json(
      { success: false, message: `Error retrieving space: ${error.message}` },
      { status: 500 }
    );
        
    }
}

// Delete space
export async function DELETE(req:NextRequest) {
    try {
        const spaceId = req.nextUrl.searchParams.get("spaceId");
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
          return NextResponse.json(
            { success: false, message: "You must be logged in to delete a space" },
            { status: 401 }
          );
        }

       if(!spaceId){
        return NextResponse.json(
            { success: false, message: "Space Id is required" },
            { status: 401 }
          );
       }

        const space = await prisma.space.findUnique({
          where: { id: spaceId },
        });
    
        if (!space) {
          return NextResponse.json(
            { success: false, message: "Space not found" },
            { status: 404 }
          );
        }
    
        
        if (space.hostId !== session.user.id) {
          return NextResponse.json(
            { success: false, message: "You are not authorized to delete this space" },
            { status: 403 }
          );
        }
    
        
        await prisma.space.delete({
          where: { id: spaceId },
        });
    
        
        return NextResponse.json(
          { success: true, message: "Space deleted successfully" },
          { status: 200 }
        );
      } catch (error: any) {
        
        console.error("Error deleting space:", error);
        return NextResponse.json(
          { success: false, message: `Error deleting space: ${error.message}` },
          { status: 500 }
        );
      }
}