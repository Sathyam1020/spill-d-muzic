import AddSongButton from "@/components/AddSongButton"
import SubscribeLeaveToggle from "@/components/SubscribeLeaveToggle"
import ToFeedButton from "@/components/ToFeedButton"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { ReactNode } from "react"

const Layout = async({
    children,
    params:{spaceId}
}: {
    children: ReactNode
    params:{spaceId:string}
}) => {
    const session = await getServerSession(authOptions); 
    const space = await prisma.space.findFirst({
        where: { id: spaceId },
        include: {
            streams: {
                include: {
                    user: true,
                    upvotes: true,
                }
            }
        }
    }); 
    const privatespace = await prisma.space.findFirst({
        where: {
            id: spaceId
        }, select: {
            isPublic :true,
            password: true,
        }
    }); 
    console.log(privatespace?.isPublic); 

    // Fetch the membership information
    const subscription = !session?.user
    ? undefined
    : await prisma.subscription.findFirst({
        where: {
          spaceId: spaceId,   // Check if the user is subscribed to the space
          userId: session.user.id,
        },
    });

    const memberCount = await prisma.subscription.count({
        where: {
            space: {
                id: spaceId
            }
        }
    }); 

    const streamCount = await prisma.stream.count({
        where: {
            spaceId: spaceId
        }
    });

    // Determine if the user is subscribed (member of the space)
    const isSubscribed = !!subscription;  // Boolean to check if the user is a member
    const isMember = isSubscribed;  // You can use `isSubscribed` as `isMember`

    return (
        <div>
            {/* <Appbar /> */}
            <div className='sm:container max-w-7xl mx-auto h-full pt-12'>
                <div>
                    <ToFeedButton text="Go back"/>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6'>
                        <ul className='flex flex-col col-span-2 space-y-6'>{children}</ul>
                        {/* info sidebar */}
                        <div className='overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last'>
                            <div className='px-6 py-4'>
                                <p className='font-semibold py-3'>About {space?.name}</p>
                            </div>
                            <dl className='divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white'>
                                <div className='flex justify-between gap-x-4 py-3'>
                                    <dt className='text-gray-500'>Members</dt>
                                    <dd className='flex items-start gap-x-2'>
                                        <div className='text-gray-900'>{memberCount}</div>
                                    </dd>
                                </div>
                                <div className='flex justify-between gap-x-4 py-3'>
                                    <dt className='text-gray-500'>Streams</dt>
                                    <dd className='flex items-start gap-x-2'>
                                        <div className='text-gray-900'>{streamCount}</div>
                                    </dd>
                                </div>

                                {space?.hostId === session?.user?.id ? (
                                    <div className="w-full">
                                        <div className='flex justify-between gap-x-4 py-3'>
                                            <dt className='text-gray-500'>You created this Space</dt>
                                        </div>
                                        <AddSongButton 
                                                    creatorId={session?.user.id as string} 
                                                    spaceId={spaceId} 
                                        />
                                    </div>
                                ) : null}

                                {space?.hostId !== session?.user?.id ? (
                                    <SubscribeLeaveToggle
                                        isSubscribed={isSubscribed}
                                        //@ts-ignore
                                        spaceId={space?.id}
                                        //@ts-ignore
                                        spaceName={space?.name}
                                        private={privatespace?.isPublic}
                                        password={privatespace?.password as string}
                                    />
                                ) : null}

                                {/* Conditionally render AddSongButton if the user is a member */}
                                {
                                    isMember && (
                                        <div className="w-full">
                                            <AddSongButton 
                                                creatorId={session?.user.id as string} 
                                                spaceId={spaceId} 
                                            />
                                        </div>
                                    )
                                }
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Layout;
