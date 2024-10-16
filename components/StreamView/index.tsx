'use client'

import React, { useEffect, useState } from 'react'
import Queue from './Queue';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import NowPlaying from './NowPlaying';
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

const StreamView = ({
    creatorId,
    playVideo,
    spaceId,
}: {
    creatorId: string;
    playVideo: boolean;
    spaceId: string;
}) => {

    const user = useSession().data?.user;

    const [queue, setQueue] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [playNextLoader, setPlayNextLoader] = useState(false);

    useEffect(() => {
        const fetchStreams = async () => {
          try {
            const res = await fetch(`/api/space/streams/create?spaceId=${spaceId}`);
            const data = await res.json();
            
            if (!res.ok) {
              throw new Error(data.message || 'Failed to fetch streams');
            }
    
            setQueue(data); 
          } catch (error: unknown) {
            if (error instanceof Error) {
              toast.error(error.message || 'Error fetching streams');
            } else {
              toast.error('Error fetching streams');
            }
          } finally {
            setLoading(false);
          }
        };
    
        fetchStreams();
      }, [spaceId]);


    const playNext = () => {
        if (queue.length === 0) {
            toast.info("No more videos in the queue!");
            return;
        }

        // Get the next video from the queue
        const nextVideo = queue[0]; // assuming the first video is next to play

        // Set current video
        setCurrentVideo(nextVideo);

        // Update the queue to remove the played video
        setQueue(prevQueue => prevQueue.slice(1));
    };

  return (
    <div>
        <Queue
            creatorId={creatorId}
            isCreator={playVideo}
            queue={queue}
            userId={user?.id || ""}
            spaceId={spaceId}
        /> 
        {
            creatorId == user?.id && (
                <NowPlaying
                    currentVideo={currentVideo}
                    playNext={playNext}
                    playNextLoader={playNextLoader}
                    playVideo={playVideo}
                />
            )
        }
    </div>
  )
}

export default StreamView; 