
// import SongList from '@/components/SongList';
// import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';
// import { getServerSession } from 'next-auth';
import StreamView from "@/components/StreamView";
const page = async({
    params:{spaceId}
    }:{
        params:{spaceId:string}
    }) => {

    const space = await prisma.space.findFirst({
        where: { id: spaceId },
        include: {
            streams: {
                
            }
        }
    }); 
    
  return (
    <div>
        <h1 className='font-bold text-3xl md:text-4xl h-14'>
            {space?.name}
        </h1>
        <StreamView spaceId={space?.id as string} playVideo={true} creatorId={space?.hostId as string}/>
    </div>
  )
}

export default page; 